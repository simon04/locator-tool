# Contributing to locator-tool

## Obtain the source code

```
git clone https://github.com/simon04/locator-tool.git
```

## Code style

Please run `pnpm fix:style` for the frontend and `gofmt -w backend` for the backend, and comply with the `.editorconfig` file.

## Running a development instance

The locator-tool relies on OAuth for editing files on Wikimedia Commons, which is challenging to setup for local development.

### Read-only frontend development

For improving the frontend of the web application without requiring save operations (i.e., "Add {{Location}}"), a very simple setup suffices. Follow the instructions from [src/](https://github.com/simon04/locator-tool/tree/master/app#readme)

### Backend development

The backend in [`backend/`](backend/) is written in Go. It serves the built frontend from `dist/` and the API:

```sh
go test ./...
pnpm build
OAUTH_CONSUMER_KEY=… OAUTH_CONSUMER_SECRET=… go run ./backend
```

Afterwards, open http://localhost:8000/. Logging in requires an own OAuth consumer whose callback URL points to the local instance, see [`INSTALLING.md`](INSTALLING.md). For `/catscan`, open an SSH tunnel to the replica and set `TOOL_REPLICA_USER`, `TOOL_REPLICA_PASSWORD` and `REPLICA_ADDR=127.0.0.1:3306`:

```sh
ssh -N -L 3306:links.commonswiki.web.db.svc.wikimedia.cloud:3306 login.toolforge.org
```
