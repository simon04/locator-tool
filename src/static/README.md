Locator-tool frontend
=====================

The frontend is an [Angular 1](https://angularjs.org/) application.

To start a development server
-----------------------------

1. `$ yarn`
2. `$ yarn run start`
3. Open your browser at http://localhost:8184/webpack-dev-server/

To build the application
------------------------

1. `$ yarn`
2. `$ yarn build`
3. The application is built to `./dist/`

Translations
------------

* Translations are done at [transifex.com/locator-tool](https://www.transifex.com/locator-tool/locator-tool/dashboard/)
* To update the translation template (POT file), run `$ yarn run pot`, followed by an upload to Transifex using `$ tx push -s`
* To update the translated files (PO files), run `$ tx pull`, followed by `$ yarn run po`
