import json
import logging
import os

from flask import Flask, abort, jsonify, request
from flask_mwoauth import MWOAuth
from flask_seasurf import SeaSurf
from location_to_wikitext import add_location_to_wikitext
from oauthlib.common import to_unicode
from talisman import Talisman
from types_mediainfo import Mediainfo
from types_query import QueryResult

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


@app.route("/edit", methods=["POST"])
def edit():
    if not mwoauth.get_current_user():
        abort(401)

    data = request.get_json()
    if (
        "pageid" not in data
        or "type" not in data
        or "lat" not in data
        or "lng" not in data
    ):
        abort(400)

    pageid = int(data["pageid"])
    type = data["type"]
    lat = float(data["lat"])
    lng = float(data["lng"])
    app.logger.info("Received request %s", str(data))

    r1: QueryResult = mwoauth_request(
        format="json",
        formatversion="2",
        action="query",
        pageids=str(pageid),
        prop="revisions",
        rvprop="content",
        rvslots="*",
        meta="tokens",
    )
    r1["query"]["pages"]
    try:
        wikitext = r1["query"]["pages"][0]["revisions"][0]["slots"]["main"]["content"]
        wikitext = to_unicode(wikitext)
    except KeyError:
        abort(404)

    try:
        token = r1["query"]["tokens"]["csrftoken"]
        app.logger.info("Obtained token=%s for pageid=%d", token, pageid)
    except KeyError:
        abort(401)

    new_wikitext = add_location_to_wikitext(type, lat, lng, wikitext)

    r2 = mwoauth_request(
        format="json",
        action="edit",
        pageid=str(pageid),
        summary="{{%s}}" % type,
        text=new_wikitext,
        token=token,
    )

    property = {
        # coordinates of the point of view (P1259)
        "Location": "P1259",
        # coordinates of depicted place (P9149)
        "Object location": "P9149",
    }[type]
    mediainfo: Mediainfo = json.loads(
        r1["query"]["pages"][0]["revisions"][0]["slots"]["mediainfo"]["content"]
    )
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
        r3 = mwoauth_request(
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
        r3 = mwoauth_request(
            format="json",
            action="wbcreateclaim",
            entity=mediainfo["id"],
            property=property,
            snaktype="value",
            value=json.dumps(coordinates),
            token=token,
        )

    return jsonify(result=r2, sdc=r3)


def mwoauth_request(**kwargs):
    return mwoauth.mwoauth.post(mwoauth.base_url + "/api.php?", data=kwargs).data


if __name__ == "__main__":
    app.run()
