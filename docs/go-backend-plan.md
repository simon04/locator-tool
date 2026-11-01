# Port the backend from Python to Go

Status: implemented on branch `go-backend`, not deployed yet.

## Why

Deployment uniformity with [bldrwnsch](https://github.com/simon04/bldrwnsch) and [dinoscan](https://github.com/simon04/dinoscan): Toolforge build service (`toolforge.yaml`, `Procfile`, `deploy.yml`) instead of uwsgi, `webservice python` and a `gh-pages` clone. One binary serves `dist/` and the API; dependencies are `go-sql-driver/mysql` and `golang.org/x/oauth2`.

## Decisions

- **No cookies.** The frontend keeps the OAuth access token in `localStorage` and sends `Authorization: Bearer …`. PKCE `state`/verifier live in `sessionStorage`; `/token` adds the client secret to the code exchange. No server-side state, no session secret, no CSRF tokens. See `INSTALLING.md`.
- **CSRF:** `http.NewCrossOriginProtection().Handler(mux)`; bearer tokens are not sent cross-site anyway.
- **Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`. HSTS comes from the Toolforge front proxy.
- **No token refresh.** When the access token expires, log in again.
- **Wikitext:** a plain `ReplaceAllLiteralString`, no `count=1`.
- **Structured data:** entity `M<pageid>` instead of looking it up via `wbentityusage`.
- **Order:** wikitext edit first (with `basetimestamp`, `starttimestamp`, `nocreate`, `assert=user`), then the claims; no claims if the edit fails.
- **Replica:** `links.commonswiki.web.db.svc.wikimedia.cloud`, since Commons moved `categorylinks`/`linktarget` there in September 2026. The live `/catscan` currently fails with 503.

## Endpoints

| Route             | Method | Notes                                                  |
| ----------------- | ------ | ------------------------------------------------------ |
| `/`, static files | GET    | SPA fallback to `index.html` (also `/oauth-callback`)  |
| `/login`          | GET    | `state`, `code_challenge` → redirect to Commons        |
| `/token`          | POST   | `{code, code_verifier}` → `{access_token, expires_in}` |
| `/user`           | GET    | `{user}`, 401 without a valid token                    |
| `/edit`           | POST   | wikitext + structured data, badtoken retry             |
| `/catscan`        | GET    | `category`, `ns`, `depth` (0–10) → `{pages}`           |
| `/healthz`        | GET    | for `health_check_http`                                |

## Before switching

- The OAuth consumer must be OAuth 2.0, confidential, callback `https://locator-tool.toolforge.org/oauth-callback`, grants "Basic rights" and "Edit existing pages".
- Set `OAUTH_CONSUMER_KEY`, `OAUTH_CONSUMER_SECRET` via `toolforge envvars`, create the deploy token, stop the old `webservice python`.
- Test login and a real edit end to end, as they can't be tested locally without an own consumer.
