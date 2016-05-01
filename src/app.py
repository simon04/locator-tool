import configparser
from flask import Flask, jsonify, request
from flask_mwoauth import MWOAuth
from flask.ext.cors import cross_origin

config = configparser.ConfigParser()
config.read('../config.ini')

app = Flask(__name__)
app.secret_key = config.get('auth', 'secret_key')

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
@cross_origin()
def user():
    r = jsonify(user=mwoauth.get_current_user(False))
    return r

@app.route("/query")
@cross_origin()
def query():
    q = {'action': 'query', 'prop': request.args.get('prop'), 'titles': request.args.get('titles')}
    r = mwoauth.request(q)
    return jsonify(r)

if __name__ == "__main__":
    app.run(debug=True)
