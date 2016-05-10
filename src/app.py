import configparser
from flask import Flask, jsonify, request
from flask_mwoauth import MWOAuth

config = configparser.ConfigParser()
config.read('../config.ini')

app = Flask(__name__)
app.secret_key = config.get('auth', 'secret_key')
app.config.update(PROPAGATE_EXCEPTIONS=True)

mwoauth = MWOAuth(base_url='https://commons.wikimedia.org/w',
                  clean_url='https://commons.wikimedia.org/wiki',
                  consumer_key=config.get('auth', 'consumer_key'),
                  consumer_secret=config.get('auth', 'consumer_secret'))
app.register_blueprint(mwoauth.bp)

@app.route("/")
def index():
    return "logged in as: " + repr(mwoauth.get_current_user(False)) + "<br>" + \
           "<a href=login>login</a> / <a href=logout>logout</a>"

@app.route("/user")
def user():
    r = jsonify(user=mwoauth.get_current_user(False))
    return r

@app.route("/edit", methods=['POST'])
def edit():
    pageid = int(request.form['pageid'])
    lat = float(request.form['lat'])
    lng = float(request.form['lng'])
    app.logger.info('Received request pageid=%d, lat=%f, lng=%f', pageid, lat, lng)

    r1 = mwoauth.request({
        'action': 'query',
        'pageids': pageid,
        'prop': 'revisions',
        'rvprop': 'content',
        'meta': 'tokens'
    })
    wikitext = r1['query']['pages'][str(pageid)]['revisions'][0]['*']
    token = r1['query']['tokens']['csrftoken']
    app.logger.info('Obtained token=%s for pageid=%d', token, pageid)

    from location_to_wikitext import add_location_to_wikitext
    new_wikitext = add_location_to_wikitext(lat, lng, wikitext)

    r2 = mwoauth.request({
        'action': 'edit',
        'pageid': str(pageid),
        'summary': '{{Location}}',
        'text': new_wikitext,
        'token': token
    }, force_multipart=True)

    return jsonify(result=r2)

if __name__ == "__main__":
    app.run()
