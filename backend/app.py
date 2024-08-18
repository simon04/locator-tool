import configparser
import json
import logging
import os
import pathlib
import typing

from flask import Flask, abort, jsonify, request
from flask_mwoauth import MWOAuth
from flask_seasurf import SeaSurf
from location_to_wikitext import add_location_to_wikitext
from oauthlib.common import to_unicode
from talisman import Talisman
from types_mediainfo import Mediainfo
from types_query import Page, QueryResult

logging.basicConfig(
    filename=os.path.join(os.path.dirname(__file__), "locator-tool.log"),
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
    level=logging.DEBUG,
)

app = Flask(__name__, static_url_path="", static_folder="static/")
app.config.from_pyfile("config.py")

# HTTP security headers
Talisman(app, content_security_policy={})

# CSRF protection. settings fitting Angular $httpProvider
app.config["CSRF_COOKIE_NAME"] = "XSRF-TOKEN"
app.config["CSRF_HEADER_NAME"] = "X-XSRF-TOKEN"
app.config["CSRF_COOKIE_PATH"] = "/"
SeaSurf(app)

mwoauth = MWOAuth(
    base_url="https://commons.wikimedia.org/w",
    clean_url="https://commons.wikimedia.org/wiki",
    consumer_key=app.config["OAUTH_CONSUMER_KEY"],
    consumer_secret=app.config["OAUTH_CONSUMER_SECRET"],
)
app.register_blueprint(mwoauth.bp)


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/user")
def user():
    r = jsonify(user=mwoauth.get_current_user(False))
    return r


LocationType = typing.Literal["Location", "Object location"]


class EditLocation(typing.TypedDict):
    type: LocationType
    lat: int
    lng: int


class EditRequest(typing.TypedDict):
    locations: list[EditLocation]
    pageid: int


@app.route("/catscan")
def catscan():
    try:
        import pymysql
        import pymysql.cursors

        replica = pathlib.Path.home().joinpath("replica.my.cnf")
        config = configparser.ConfigParser()
        config.read_string(replica.read_text())
        connection = pymysql.connections.Connection(
            host="commonswiki.analytics.db.svc.wikimedia.cloud",
            database="commonswiki_p",
            user=config.get("client", "user"),
            password=config.get("client", "password"),
            cursorclass=pymysql.cursors.DictCursor,
        )

        def list_recursively(category: str, ns: int, depth=3):
            sql = """
                WITH RECURSIVE catscan AS (
                    SELECT p.page_title, p.page_namespace, 1 as depth
                    FROM categorylinks c
                    JOIN page p ON c.cl_from = p.page_id AND p.page_is_redirect = 0
                    WHERE c.cl_to = %s
                    UNION ALL
                    SELECT p.page_title, p.page_namespace, catscan.depth + 1
                    FROM catscan
                    JOIN categorylinks c ON c.cl_to = catscan.page_title AND catscan.page_namespace = 14
                    JOIN page p ON c.cl_from = p.page_id AND p.page_is_redirect = 0
                    WHERE catscan.depth < %s
                )
                SELECT catscan.page_title
                FROM catscan
                WHERE catscan.page_namespace = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(sql, (category, depth, ns))
                for row in cursor:
                    title: str | bytes = row["page_title"]
                    if isinstance(title, bytes):
                        title = title.decode("utf8")
                    yield title

        pages = list_recursively(
            category=request.args.get("category").replace(" ", "_"),
            ns=request.args.get("ns", 0, type=int),
            depth=request.args.get("depth", 0, type=int),
        )
        return jsonify(pages=list(set(pages)))
    except Exception as e:
        if connection:
            connection.close()
        logging.error("Failed to list category for %s", request.args, exc_info=e)


@app.route("/edit", methods=["POST"])
def edit():
    if not mwoauth.get_current_user():
        abort(401)

    data: EditRequest = request.get_json()
    if (
        not data
        or "pageid" not in data
        or "locations" not in data
        or not all("type" in d or "lat" in d or "lng" in d for d in data["locations"])
    ):
        abort(400)

    pageid = int(data["pageid"])
    locations = data["locations"]
    app.logger.info("Received request %s", str(data))

    r1: QueryResult = mwoauth_request(
        format="json",
        formatversion="2",
        action="query",
        pageids=str(pageid),
        prop="revisions|wbentityusage",
        rvprop="content",
        rvslots="*",
        meta="tokens",
    )

    try:
        token = r1["query"]["tokens"]["csrftoken"]
        app.logger.info("Obtained token=%s for pageid=%d", token, pageid)
    except KeyError:
        abort(401)

    page = r1["query"]["pages"][0]
    try:
        wikitext = page["revisions"][0]["slots"]["main"]["content"]
        wikitext = to_unicode(wikitext)
    except KeyError:
        abort(404)

    for location in locations:
        wikitext = add_location_to_wikitext(
            type=location["type"],
            lat=float(location["lat"]),
            lng=float(location["lng"]),
            wikitext=wikitext,
        )
        edit_mediainfo(
            type=location["type"],
            lat=float(location["lat"]),
            lng=float(location["lng"]),
            page=page,
            token=token,
        )

    r2 = mwoauth_request(
        format="json",
        action="edit",
        pageid=str(pageid),
        summary=", ".join("{{%s}}" % d["type"] for d in locations),
        text=wikitext,
        token=token,
    )

    return jsonify(result=r2)


def get_mediainfo(page: Page) -> Mediainfo:
    slots = page["revisions"][0]["slots"]
    if "mediainfo" in slots:
        return json.loads(slots["mediainfo"]["content"])
    ids = (k for k in page.get("wbentityusage", {}).keys() if k.startswith("M"))
    id = next(ids, None)
    if id:
        return {"id": id, "statements": {}}
    return None


def edit_mediainfo(type: LocationType, lat: float, lng: float, page: Page, token: str):
    mediainfo = get_mediainfo(page)
    if not mediainfo:
        return None

    property = {
        # coordinates of the point of view (P1259)
        "Location": "P1259",
        # coordinates of depicted place (P9149)
        "Object location": "P9149",
    }[type]
    statements = mediainfo["statements"]
    coordinates = {
        "latitude": lat,
        "longitude": lng,
        "globe": "http://www.wikidata.org/entity/Q2",
        "precision": 0.000001,
    }

    if property in statements and len(statements[property]):
        # https://www.wikidata.org/w/api.php?action=help&modules=wbsetclaimvalue
        claim = statements[property][0]
        app.logger.info(
            "For mediaitem %s, updating claim %s/%s",
            mediainfo["id"],
            property,
            claim["id"],
        )
        return mwoauth_request(
            format="json",
            action="wbsetclaimvalue",
            claim=claim["id"],
            snaktype="value",
            value=json.dumps(coordinates),
            token=token,
        )
    else:
        # https://www.wikidata.org/w/api.php?action=help&modules=wbcreateclaim
        app.logger.info(
            "For mediaitem %s, creating claim %s",
            mediainfo["id"],
            property,
        )
        return mwoauth_request(
            format="json",
            action="wbcreateclaim",
            entity=mediainfo["id"],
            property=property,
            snaktype="value",
            value=json.dumps(coordinates),
            token=token,
        )


def mwoauth_request(**kwargs):
    return mwoauth.mwoauth.post(mwoauth.base_url + "/api.php?", data=kwargs).data


if __name__ == "__main__":
    app.run()
