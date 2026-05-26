# Locator-tool frontend

The frontend is a [Vue.js 3](https://vuejs.org/) application.

## To start a development server

1. `$ pnpm install`
2. `$ pnpm dev`
3. Open your browser at http://localhost:5173/

## To build the application

1. `$ pnpm install`
2. `$ pnpm build`
3. The application is built to `./dist/`

## Translations

- Translations are done at [transifex.com/locator-tool](https://app.transifex.com/locator-tool/locator-tool/dashboard/)
- To update the translation template (POT file), run `$ pnpm pot`, followed by an upload to Transifex using `$ tx push -s`
- To update the translated files (PO files), run `$ tx pull`, followed by `$ pnpm po`
