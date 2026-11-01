# Plan: port the backend from Python to Go

Status: proposal, open for comments.

## Motivation

The backend is small (~350 LOC Flask in `backend/app.py`, plus `location_to_wikitext.py`).
The main gain is deployment uniformity with [bldrwnsch](https://github.com/simon04/bldrwnsch) and [dinoscan](https://github.com/simon04/dinoscan),
not the code itself:

- Toolforge build service with `toolforge.yaml`, `Procfile` and a GitHub `deploy.yml`
  (copy from bldrwnsch), instead of the manual steps in `INSTALLING.md`
  (uwsgi, `webservice python start`, `www/python/src` symlink, cloning `gh-pages` into `static/`)
- A single binary serves `dist/` and the API (copy `handleStatic` from dinoscan)
- Six Python dependencies (Flask, Flask-SeaSurf, authlib, talisman, PyMySQL, requests)
  shrink to `go-sql-driver/mysql` and `golang.org/x/oauth2`
- `/catscan` maps onto dinoscan's `internal/replica` (`replica.my.cnf`, pools, context timeouts)

## Layout

Following dinoscan:

```
go.mod                       # module at repo root, "+heroku install ./backend"
backend/main.go              # env config, http.Server, graceful shutdown
backend/internal/server/     # routes, static files, security headers, CSRF
backend/internal/auth/       # OAuth2 + PKCE, encrypted session cookie, token refresh
backend/internal/wikitext/   # AddLocation (port of location_to_wikitext.py)
backend/internal/mediawiki/  # api.php client: query, edit, wbcreateclaim, wbsetclaimvalue
backend/internal/replica/    # catscan query on commonswiki_p
Procfile
toolforge.yaml
.github/workflows/go-ci.yml
.github/workflows/deploy.yml
```

Configuration via environment variables (Toolforge envvars) instead of `config.py`:
`OAUTH_CONSUMER_KEY`, `OAUTH_CONSUMER_SECRET`, `SESSION_KEY`, `PORT`, `DIST_DIR`.
The OAuth URLs and scope stay constants with optional overrides.

## Endpoints

| Route             | Method | Notes                                                             |
| ----------------- | ------ | ----------------------------------------------------------------- |
| `/`, static files | GET    | SPA fallback to `index.html`, immutable caching for `assets/`     |
| `/login`          | GET    | PKCE S256, state + verifier in short-lived cookie, honour `next=` |
| `/oauth-callback` | GET    | exchange code, store token in session cookie, redirect to `next`  |
| `/logout`         | GET    | clear session, honour `next=`                                     |
| `/user`           | GET    | `rest.php/oauth2/resource/profile` → `{"user": username}`         |
| `/catscan`        | GET    | `category`, `ns`, `depth` → `{"pages": [...]}`                    |
| `/edit`           | POST   | wikitext edit + mediainfo claims, badtoken retry                  |
| `/healthz`        | GET    | for `health_check_http`                                           |

`next=` must be restricted to local paths (open redirect).

## Steps

1. **Scaffold**: `go.mod`, `backend/main.go`, static serving, `/healthz`, `go-ci.yml`.
2. **wikitext**: port `add_location_to_wikitext` and port `test_location_to_wikitext.py`
   as a table-driven test first. Pitfalls:
   - Go has no `re.sub(count=1)`: use `FindStringIndex` and splice
   - use literal replacement (`$` vs `\` semantics differ)
   - float formatting: `strconv.FormatFloat(x, 'f', -1, 64)` vs Python `str(float)`
     (`1e-05` in Python), check against the existing test cases
   - `(?i)` for `re.IGNORECASE`, brace counting stays a byte loop
3. **catscan**: reuse dinoscan's replica code, recursive CTE unchanged,
   proper JSON error responses instead of the current implicit 500.
4. **auth**: `oauth2.Config` with `GenerateVerifier`/`S256ChallengeOption`.
   Session cookie encrypted (AES-GCM, key from `SESSION_KEY`), `HttpOnly`, `Secure`, `SameSite=Lax`.
   Token refresh: wrap the `TokenSource`, compare the token after each request
   and rewrite the cookie when it changed (cf. `eca40cf`, otherwise each request
   refreshes and invalidates the CSRF token).
5. **edit**: query revisions + `wbentityusage` + csrftoken, update wikitext,
   create or update P1259 / P9149 claim, `action=edit`, retry once on `badtoken` (cf. `80f5720`).
   Typed structs for the request and the query result; `map[string]any` only where needed.
6. **Security headers**: small middleware replacing Talisman
   (HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
7. **CSRF**: Go 1.25 `http.CrossOriginProtection` (`Sec-Fetch-Site`/`Origin` based).
   Then drop the `XSRF-TOKEN` cookie/header handling in `app/api/ltDataAuth.ts`.
   Alternative: keep the double-submit cookie (~30 LOC) and leave the frontend untouched.
8. **Deploy**: `toolforge.yaml` + `deploy.yml` (from bldrwnsch), set envvars,
   verify the OAuth consumer callback URL (`/oauth-callback`) and grants.
9. **Clean up**: remove `backend/*.py`, `pyproject.toml`, `uv.lock`, `.python-version`,
   `main.py`, `uwsgi.ini`, `Caddyfile`, `python-ci.yml`; rewrite `INSTALLING.md`;
   possibly stop publishing `gh-pages` (frontend is built by the buildpack or CI).

## Bugs fixed along the way

- `/catscan`: `connection` unbound in `except` when connecting fails; returns `None` on error
- `/edit`: validation uses `or` instead of `and`, so a missing `lat` passes and raises `KeyError`
- `/user`: `.json()` called before `raise_for_status()`
- `/login`, `/logout`: `next=` parameter from the frontend is ignored

## Risks

- OAuth/session/CSRF are not covered by bldrwnsch or dinoscan, so they are new code;
  steps 4 and 5 can only be tested end-to-end against Commons OAuth.
- Cutover logs out all users (Flask session cookies are not readable by Go).
- Current ingress (`Caddyfile`, `uwsgi.ini`) looks stale; check what is actually
  running on `locator-tool.toolforge.org` before switching to the build service.
- How is the frontend built on Toolforge: Node buildpack in the same image,
  or download the CI artifact / `gh-pages`?

## Open questions

- CSRF: `CrossOriginProtection` (simpler, frontend change) or keep `XSRF-TOKEN`?
- Session: encrypted cookie (stateless) or server-side store (ToolsDB/Redis)?
- Frontend build: on Toolforge (Node + Go buildpacks) or from CI?
