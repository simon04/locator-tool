from flask import Flask, jsonify, request, abort
from talisman import Talisman
from flask_seasurf import SeaSurf
import mwoauth
import mwoauth.flask
from oauthlib.common import to_unicode

import logging
import os
logging.basicConfig(
    filename=os.path.join(os.path.dirname(__file__), 'locator-tool.log'),
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    level=logging.DEBUG,
)


class LocatorToolApp(Flask):
    def __init__(self):
        super(LocatorToolApp, self).__init__(
            __name__,
             static_url_path='',
            static_folder='static/',
        )
    def add_url_rule(self, rule, endpoint=None, view_func=None, provide_automatic_options=None, **options):
        remap_rule = {
            '/mwoauth/initiate/': '/login',
            '/mwoauth/callback/': '/oauth-callback',
            '/mwoauth/identify/': '/user',
            '/mwoauth/logout/': '/logout',
        }
        super(LocatorToolApp, self).add_url_rule(
            rule=remap_rule.get(rule, rule),
            endpoint=endpoint,
            view_func=view_func,
            provide_automatic_options=provide_automatic_options,
            **options,
        )


app = LocatorToolApp()
app.config.from_pyfile('config.py')

# HTTP security headers
Talisman(app, content_security_policy={})

# CSRF protection. settings fitting Angular $httpProvider
app.config['CSRF_COOKIE_NAME'] = 'XSRF-TOKEN'
app.config['CSRF_HEADER_NAME'] = 'X-XSRF-TOKEN'
app.config['CSRF_COOKIE_PATH'] = '/locator-tool/'
SeaSurf(app)

flask_mwoauth = mwoauth.flask.MWOAuth(
    host='https://commons.wikimedia.org/w',
    consumer_token=mwoauth.ConsumerToken(
        app.config['OAUTH_CONSUMER_KEY'], app.config['OAUTH_CONSUMER_SECRET']),
)
app.register_blueprint(flask_mwoauth.bp)


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/edit', methods=['POST'])
@mwoauth.flask.authorized
def edit():
    data = request.get_json()
    if 'pageid' not in data or 'type' not in data \
            or 'lat' not in data or 'lng' not in data:
        abort(400)
    pageid = int(data['pageid'])
    type = data['type']
    lat = float(data['lat'])
    lng = float(data['lng'])
    app.logger.info('Received request %s', str(data))

    mwapi_session = flask_mwoauth.mwapi_session(
        host='https://commons.wikimedia.org',
    )
    r1 = mwapi_session.post(
        action='query',
        pageids=pageid,
        prop='revisions',
        rvprop='content',
        meta='tokens',
        format='json',
    )
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

    r2 = mwapi_session.post(
        action='edit',
        pageid=str(pageid),
        summary='{{%s}}' % type,
        text=new_wikitext,
        token=token,
        format='json',
    )

    return jsonify(result=r2)


if __name__ == '__main__':
    app.run()
