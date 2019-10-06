Contributing to locator-tool
============================

## Obtain the source code

```
git clone https://github.com/simon04/locator-tool.git
```

## Code style

Please make your code comply with [PEP 8](https://www.python.org/dev/peps/pep-0008/), the `.eslint` and `.editorconfig` files.

## Running a development instance

The locator-tool relies on OAuth for editing files on Wikimedia Commons, which is challenging to setup for local development.

### Read-only frontend development

For improving the frontend of the web application without requiring save operations (i.e., "Add {{Location}}"), a very simple setup suffices. Follow the instructions from [src/](https://github.com/simon04/locator-tool/tree/master/app#readme)

### Read-write frontend development

When also want to test/improve the interaction with the Python backend, you can run a local webserver for https://tools.wmflabs.org/ which serves the local frontend code and proxies all requests to the actual server:

```sh
cd dev/

# generate TLS keys for CN=tools.wmflabs.org
openssl req -new -x509 -nodes -newkey rsa:4096 -keyout server.key -out server.crt

# add tools.wmflabs.org entry to hosts file
echo 127.0.0.1 tools.wmflabs.org | sudo tee -a /etc/hosts

# run server for tools.wmflabs.org on port 443
sudo caddy
```

Afterwards, open https://tools.wmflabs.org/locator-tool/ in the browser.

### Local backend development

See `INSTALLING.md` and figure something out …
