Installing locator-tool
=======================

```sh
$ mkdir -p www
$ cd www/

$ git clone --recurse-submodules https://github.com/simon04/locator-tool.git python
$ cd python/

$ virtualenv venv
$ source venv/bin/activate
$ cd src/
$ pip install

$ cp config-example.ini config.ini
# generate random string for secret_key
# for consumer_key+consumer_secret see below

$ webservice2 uwsgi-python start
```

## Register OAuth client

Register tool at https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose with "OAuth callback URL" = https://tools.wmflabs.org/locator-tool/oauth-callback and "Edit existing pages" grant. Insert the displayed strings as `consumer_key`+`consumer_secret` into the `config.ini` file.

## Further information

For more details, see:

* https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Python_application_stub
* https://www.mediawiki.org/wiki/Extension:OAuth
* https://www.github.com/valhallasw/flask-mwoauth
