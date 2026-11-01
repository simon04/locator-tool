# Installing locator-tool

locator-tool runs on [Toolforge](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Deploy_your_tool) using the build service: the Node.js buildpack builds the frontend into `dist/`, the Go buildpack builds `./backend`, and [`Procfile`](Procfile) runs it. See [`toolforge.yaml`](toolforge.yaml).

## Register OAuth client

Propose an OAuth 2.0 consumer at https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2 with

- "OAuth callback URL" = https://locator-tool.toolforge.org/oauth-callback
- "Client is confidential"
- grants "Basic rights" and "Edit existing pages"

## Deploy

```sh
ssh login.toolforge.org
become locator-tool
toolforge envvars create OAUTH_CONSUMER_KEY
toolforge envvars create OAUTH_CONSUMER_SECRET
curl -O https://raw.githubusercontent.com/simon04/locator-tool/master/toolforge.yaml
toolforge components config create toolforge.yaml  # once, afterwards fetched from source_url
toolforge components deployment create
```

Further deployments run from GitHub Actions ([`deploy.yml`](.github/workflows/deploy.yml)) on each push to `master`, once Node CI passed. They need a deploy token (`toolforge components deploy-token create`) in the repository secret `TOOLS_DEPLOY_TOKEN`.

## Configuration

| Variable                                      | Default                                             | Meaning                                              |
| --------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `OAUTH_CONSUMER_KEY`, `OAUTH_CONSUMER_SECRET` |                                                     | OAuth 2.0 client, required                           |
| `TOOL_REPLICA_USER`, `TOOL_REPLICA_PASSWORD`  |                                                     | replica credentials for `/catscan`; set by Toolforge |
| `REPLICA_ADDR`                                | `links.commonswiki.web.db.svc.wikimedia.cloud:3306` | Commons replica holding the category tables          |
| `PORT`                                        | `8000`                                              | HTTP port                                            |
| `DIST_DIR`                                    | `dist`                                              | built frontend                                       |

## Authentication

There are no cookies. The frontend generates the OAuth `state` and PKCE code verifier, keeps them in `sessionStorage` and starts the login at `/login`. Commons redirects back to `/oauth-callback` (served by the frontend), which posts the code and verifier to `/token`; the backend adds the client secret and returns the access token. The frontend keeps it in `localStorage` and sends it as `Authorization: Bearer …` to `/user` and `/edit`, which pass it on to Commons. Logging out forgets the token. When the access token expires, log in again.
