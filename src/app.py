import configparser
from flask import Flask, jsonify, request, abort
from flask_mwoauth import MWOAuth
from talisman import Talisman
from flask_seasurf import SeaSurf
from oauthlib.common import to_unicode
import logging
from logging.handlers import TimedRotatingFileHandler

config = configparser.ConfigParser()
config.read('../config.ini')

app = Flask(__name__, static_url_path='', static_folder='static/dist')
app.secret_key = config.get('auth', 'secret_key')
app.config.update(PROPAGATE_EXCEPTIONS=True)

# HTTP security headers
Talisman(app, content_security_policy={})

# CSRF protection. settings fitting Angular $httpProvider
app.config['CSRF_COOKIE_NAME'] = 'XSRF-TOKEN'
app.config['CSRF_HEADER_NAME'] = 'X-XSRF-TOKEN'
SeaSurf(app)

logfile = TimedRotatingFileHandler(filename='locator-tool.log', when='midnight')
logfile.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logfile.setLevel(logging.INFO)
app.logger.addHandler(logfile)
logging.getLogger('werkzeug').addHandler(logfile)

mwoauth = MWOAuth(base_url='https://commons.wikimedia.org/w',
                  clean_url='https://commons.wikimedia.org/wiki',
                  consumer_key=config.get('auth', 'consumer_key'),
                  consumer_secret=config.get('auth', 'consumer_secret'))
app.register_blueprint(mwoauth.bp)


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/user')
def user():
    r = jsonify(user=mwoauth.get_current_user(False))
    return r


@app.route('/edit', methods=['POST'])
def edit():
    if not mwoauth.get_current_user():
        abort(401)
    data = request.get_json()
    if 'pageid' not in data or 'type' not in data \
        or 'lat' not in data or 'lng' not in data:
        abort(400)
    pageid = int(data['pageid'])
    type = data['type']
    lat = float(data['lat'])
    lng = float(data['lng'])
    app.logger.info('Received request %s', str(data))

    r1 = mwoauth_request({
        'action': 'query',
        'pageids': pageid,
        'prop': 'revisions',
        'rvprop': 'content',
        'meta': 'tokens'
    })
    try:
        wikitext = r1['query']['pages'][str(pageid)]['revisions'][0]['*']
        wikitext = to_unicode(wikitext)
    except KeyError:
        abort(404)
    try:
        token = r1['query']['tokens']['csrftoken']
    except KeyError:
        abort(401)
    app.logger.info('Obtained token=%s for pageid=%d', token, pageid)

    from location_to_wikitext import add_location_to_wikitext
    new_wikitext = add_location_to_wikitext(type, lat, lng, wikitext)

    r2 = mwoauth_request({
        'action': 'edit',
        'pageid': str(pageid),
        'summary': '{{%s}}' % type,
        'text': new_wikitext,
        'token': token
    })

    return jsonify(result=r2)


def mwoauth_request(api_query):
    api_query['format'] = 'json'
    return mwoauth.mwoauth.post(mwoauth.base_url + '/api.php?', data=api_query).data

if __name__ == '__main__':
    app.run()
