# Locator-tool frontend

The frontend is a [Vue.js 3](https://vuejs.org/) application.

## To start a development server

1. `$ bun install`
2. `$ bun run serve`
3. Open your browser at http://localhost:8000/

## To build the application

1. `$ bun install`
2. `$ bun run build`
3. The application is built to `./dist/`

## Translations

- Translations are done at [transifex.com/locator-tool](https://www.transifex.com/locator-tool/locator-tool/dashboard/)
- To update the translation template (POT file), run `$ bun run pot`, followed by an upload to Transifex using `$ tx push -s`
- To update the translated files (PO files), run `$ tx pull`, followed by `$ bun run po`
