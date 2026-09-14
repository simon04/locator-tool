# Locator-tool frontend

The frontend is a [Vue.js 3](https://vuejs.org/) application.

## To start a development server

1. `$ pnpm install`
2. `$ pnpm dev`
3. Open your browser at http://localhost:5173/

## Configuration

The wiki and the OAuth 2.0 client are configured in `.env`:

- `VITE_COMMONS_URL` — the Commons deployment to read from and write to
- `VITE_OAUTH_CLIENT_ID` — a public (non-confidential) OAuth 2.0 client with PKCE, registered at
  [Special:OAuthConsumerRegistration](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose)
  with the "Edit existing pages" grant and the deployed URL as "OAuth callback URL"
- `VITE_OAUTH_REDIRECT_URI` — only needed when the callback URL differs from the origin the app is served from

`.env.beta` points at the beta cluster: `$ pnpm dev --mode beta`, `$ pnpm build --mode beta`.

## Cross-origin requests

The app talks to Commons from whatever origin it is served from, which constrains how each
request is made ([API:Cross-site requests](https://www.mediawiki.org/wiki/API:Cross-site_requests)):

- reads via `api.php` pass `origin=*` and are anonymous
- writes to the wikitext use the REST API, which allows `Authorization` from any origin
- writes to the structured data use `api.php` with `crossorigin=` next to the bearer token
  (MediaWiki 1.44+), and must not send cookies — hence `credentials: 'omit'`

The Wikibase REST API is not an option for the latter: it rejects MediaInfo entity ids.

## To build the application

1. `$ pnpm install`
2. `$ pnpm build`
3. The application is built to `./dist/`

## Translations

- Translations are done at [transifex.com/locator-tool](https://app.transifex.com/locator-tool/locator-tool/dashboard/)
- To update the translation template (POT file), run `$ pnpm pot`, followed by an upload to Transifex using `$ tx push -s`
- To update the translated files (PO files), run `$ tx pull`, followed by `$ pnpm po`
