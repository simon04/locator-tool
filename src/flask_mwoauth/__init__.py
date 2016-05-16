#!/usr/bin/env python
# MediaWiki OAuth connector for Flask
#
# Requires flask-oauthlib
#
# (C) 2013 Merlijn van Deen <valhallasw@arctus.nl>
# Licensed under the MIT License // http://opensource.org/licenses/MIT
#

__version__ = '0.2.46'

import sys
from future.utils import iteritems
from future.moves.urllib.parse import urlencode
from flask import request, session, redirect, url_for, flash, Blueprint
from flask_oauthlib.client import OAuth, OAuthException
from requests.models import Request


class MWOAuth(object):
    def __init__(self,
                 base_url='https://www.mediawiki.org/w',
                 clean_url='https://www.mediawiki.org/wiki',
                 default_return_to='index',
                 consumer_key=None, consumer_secret=None, name='mw.org'):
        if not consumer_key or not consumer_secret:
            raise Exception('MWOAuthBlueprintFactory needs consumer key and secret')
        self.base_url = base_url

        self.default_return_to = default_return_to

        self.oauth = OAuth()
        request_url_params = {'title': 'Special:OAuth/initiate',
                              'oauth_callback': 'oob'}
        access_token_params = {'title': 'Special:OAuth/token'}
        self.mwoauth = self.oauth.remote_app(
            name,
            base_url=base_url + "/index.php",
            request_token_url=base_url + "/index.php?" +
                              urlencode(request_url_params),
            request_token_params=None,
            access_token_url=base_url + "/index.php?" +
                             urlencode(access_token_params),
            authorize_url=clean_url + '/Special:OAuth/authorize',
            consumer_key=consumer_key,
            consumer_secret=consumer_secret,
        )

        @self.mwoauth.tokengetter
        def get_mwo_token(token=None):
            return session.get('mwo_token')

        self.bp = Blueprint('mwoauth', __name__)

        @self.bp.route('/logout')
        def logout():
            session['mwo_token'] = None
            session['username'] = None
            if 'next' in request.args:
                return redirect(request.args['next'])
            return "Logged out!"

        @self.bp.route('/login')
        def login():
            uri_params = {'oauth_consumer_key': self.mwoauth.consumer_key}
            redirector = self.mwoauth.authorize(**uri_params)

            if 'next' in request.args:
                oauth_token = session[self.mwoauth.name + '_oauthtok'][0]
                session[oauth_token + '_target'] = request.args['next']

            return redirector

        @self.bp.route('/oauth-callback')
        def oauth_authorized():
            resp = self.mwoauth.authorized_response()
            next_url_key = request.args['oauth_token'] + '_target'
            default_url = url_for(self.default_return_to)

            next_url = session.pop(next_url_key, default_url)

            if resp is None:
                flash(u'You denied the request to sign in.')
                return redirect(next_url)
            session['mwo_token'] = (
                resp['oauth_token'],
                resp['oauth_token_secret']
            )

            username = self.get_current_user(False)
            flash('You were signed in, %s!' % username)

            return redirect(next_url)

    @staticmethod
    def _prepare_long_request(url, api_query):
        """ Use requests.Request and requests.PreparedRequest to produce the
            body (and boundary value) of a multipart/form-data; POST request as
            detailed in https://www.mediawiki.org/wiki/API:Edit#Large_texts
        """

        partlist = []
        for k, v in iteritems(api_query):
            if k in ('title', 'text', 'summary'):
                # title,  text and summary values in the request
                # should be utf-8 encoded

                part = (k,
                        (None, v.encode('utf-8'),
                         'text/plain; charset=UTF-8',
                         {'Content-Transfer-Encoding': '8bit'}
                         )
                        )
            else:
                part = (k, (None, v))
            partlist.append(part)

        return Request(url=url, files=partlist).prepare()

    def request(self, api_query, url=None):
        """ e.g. {'action': 'query', 'meta': 'userinfo'}. format=json not required
            function returns a python dict that resembles the api's json response
        """
        api_query['format'] = 'json'
        url = url or self.base_url

        size = sum([sys.getsizeof(v) for k, v in iteritems(api_query)])

        if size > (1024 * 8):
            # if request is bigger than 8 kB (the limit is somewhat arbitrary,
            # see https://www.mediawiki.org/wiki/API:Edit#Large_texts) then
            # transmit as multipart message

            req = self._prepare_long_request(url=url + "/api.php?",
                                             api_query=api_query
                                             )
            return self.mwoauth.post(url + "/api.php?",
                                     data=req.body,
                                     content_type=req.headers['Content-Type']
                                     ).data
        else:
            return self.mwoauth.post(url + "/api.php?" + urlencode(api_query),
                                     content_type="text/plain").data

    def get_current_user(self, cached=True):
        if cached:
            return session.get('username')

        try:
            data = self.request({'action': 'query', 'meta': 'userinfo'})
            session['username'] = data['query']['userinfo']['name']
        except KeyError:
            session['username'] = None
            if data['error']['code'] == "mwoauth-invalid-authorization":
                flash(u'Access to this application was revoked. Please re-login!')
            else:
                raise
        except OAuthException:
            session['username'] = None
        return session['username']
