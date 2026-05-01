import configparser
import json
import logging
import pathlib
import typing

from flask import Flask, abort, jsonify, request
from flask_seasurf import SeaSurf
from requests import Response
from location_to_wikitext import add_location_to_wikitext
from talisman import Talisman
from types_mediainfo import Mediainfo
from types_query import Page, QueryResult
from flask import session, redirect
from authlib.integrations.flask_client import FlaskOAuth2App, OAuth


logging.basicConfig(
    # filename=str(pathlib.Path(__file__).parent.joinpath("locator-tool.log")),
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

oauth = OAuth(app)
oauth.register(
    name="mediawiki",
    client_id=app.config["OAUTH_CONSUMER_KEY"],
    client_secret=app.config["OAUTH_CONSUMER_SECRET"],
    client_kwargs={
        "code_challenge_method": app.config["OAUTH_CODE_CHALLENGE_METHOD"],
        "scope": app.config["OAUTH_SCOPE"],
    },
    api_base_url=app.config["OAUTH_API_BASE_URL"],
    access_token_url=app.config["OAUTH_ACCESS_TOKEN_URL"],
    authorize_url=app.config["OAUTH_AUTHORIZE_URL"],
)
oauth_client: FlaskOAuth2App = oauth.create_client("mediawiki")


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/login")
def login():
    return oauth_client.authorize_redirect()


@app.route("/oauth-callback")
def auth():
    token = oauth_client.authorize_access_token()
    session["token"] = token
    return redirect("/")


@app.route("/logout")
def logout():
    session.pop("token", None)
    session.clear()
    return redirect("/")


@app.route("/user")
def user():
    token = session["token"]
    response: Response = oauth_client_request(
        "GET",
        "rest.php/oauth2/resource/profile",
        access_token=token,
    )
    user = response.json()
    response.raise_for_status()
    r = jsonify(user=user["username"])
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
                SELECT DISTINCT catscan.page_title
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
        return jsonify(pages=list(pages))
    except Exception as e:
        if connection:
            connection.close()
        logging.error("Failed to list category for %s", request.args, exc_info=e)


@app.route("/edit", methods=["POST"])
def edit():
    if "token" not in session:
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

    response: Response = oauth_client_request(
        "POST",
        "api.php",
        access_token=session["token"],
        format="json",
        formatversion="2",
        action="query",
        pageids=str(pageid),
        prop="revisions|wbentityusage",
        rvprop="content",
        rvslots="*",
        meta="tokens",
    )
    r1: QueryResult = response.json()

    try:
        token = r1["query"]["tokens"]["csrftoken"]
        app.logger.info("Obtained token=%s for pageid=%d", token, pageid)
    except KeyError:
        abort(401)

    page = r1["query"]["pages"][0]
    try:
        wikitext = page["revisions"][0]["slots"]["main"]["content"]
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

    response = oauth_client_request(
        "POST",
        "api.php",
        access_token=session["token"],
        format="json",
        action="edit",
        pageid=str(pageid),
        summary=", ".join("{{%s}}" % d["type"] for d in locations),
        text=wikitext,
        token=token,
    )
    r2 = response.json()

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
        response: Response = oauth_client_request(
            "POST",
            "api.php",
            access_token=session["token"],
            format="json",
            action="wbsetclaimvalue",
            claim=claim["id"],
            snaktype="value",
            value=json.dumps(coordinates),
            token=token,
        )
        response.raise_for_status()
        return response.json()
    else:
        # https://www.wikidata.org/w/api.php?action=help&modules=wbcreateclaim
        app.logger.info(
            "For mediaitem %s, creating claim %s",
            mediainfo["id"],
            property,
        )
        response: Response = oauth_client_request(
            "POST",
            "api.php",
            access_token=session["token"],
            format="json",
            action="wbcreateclaim",
            entity=mediainfo["id"],
            property=property,
            snaktype="value",
            value=json.dumps(coordinates),
            token=token,
        )


def oauth_client_request(method, url, access_token=None, **kwargs):
    # Copy oauth_client.request, but rename `token` to `access_token` to fix:
    # TypeError: __main__.request() got multiple values for keyword argument 'token'
    metadata = oauth_client.load_server_metadata()
    with oauth_client._get_oauth_client(**metadata) as session:
        return oauth_client._send_token_request(
            session, method, url, access_token, kwargs
        )


if __name__ == "__main__":
    app.run()
