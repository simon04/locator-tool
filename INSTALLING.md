# Installing locator-tool

locator-tool runs on [Toolforge](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Deploy_your_tool) using the build service: the Node.js buildpack builds the frontend into `dist/`, the Go buildpack builds `./backend`, and [`Procfile`](Procfile) runs it. See [`toolforge.yaml`](toolforge.yaml).

## OAuth client

locator-tool uses the existing OAuth 2.0 consumer [locator-tool 4.0](https://meta.wikimedia.org/wiki/Special:OAuthListConsumers/view/d61b2b3ceda1f5faf12a8d965d531334): callback URL https://locator-tool.toolforge.org/oauth-callback, not confidential, grants "Interact with pages" and "Edit existing pages". Its key is built in; no OAuth configuration is needed.

## Deploy

```sh
ssh login.toolforge.org
become locator-tool
curl -O https://raw.githubusercontent.com/simon04/locator-tool/master/toolforge.yaml
toolforge components config create toolforge.yaml  # once, afterwards fetched from source_url
toolforge components deployment create
```

Further deployments run from GitHub Actions ([`deploy.yml`](.github/workflows/deploy.yml)) on each push to `master`, once Node CI passed. They need a deploy token (`toolforge components deploy-token create`) in the repository secret `TOOLS_DEPLOY_TOKEN`.

## Configuration

| Variable                                     | Default                                             | Meaning                                              |
| -------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `OAUTH_CONSUMER_KEY`                         | `d61b2b3ceda1f5faf12a8d965d531334`                  | OAuth 2.0 client                                     |
| `OAUTH_CONSUMER_SECRET`                      |                                                     | OAuth 2.0 client secret, optional                    |
| `TOOL_REPLICA_USER`, `TOOL_REPLICA_PASSWORD` |                                                     | replica credentials for `/catscan`; set by Toolforge |
| `REPLICA_ADDR`                               | `links.commonswiki.web.db.svc.wikimedia.cloud:3306` | Commons replica holding the category tables          |
| `PORT`                                       | `8000`                                              | HTTP port                                            |
| `DIST_DIR`                                   | `dist`                                              | built frontend                                       |

## Authentication

There are no cookies. The frontend generates the OAuth `state` and PKCE code verifier, keeps them in `sessionStorage` and starts the login at `/login`. Commons redirects back to `/oauth-callback` (served by the frontend), which posts the code and verifier to `/token`; the backend exchanges them for the access token. The frontend keeps it in `localStorage` and sends it as `Authorization: Bearer …` to `/user` and `/edit`, which pass it on to Commons. Logging out forgets the token. When the access token expires, log in again.
