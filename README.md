# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Live registry server

The global map now polls a lightweight registry service that keeps track of node
locations and their latest heartbeat. You can run a local instance of the
registry alongside the Docusaurus dev server:

```bash
# start the registry (defaults to http://0.0.0.0:4000)
yarn registry

# in another terminal start the docs (which proxy to the same origin by default)
yarn start
```

Set the `AGRINET_REGISTRY_URL` environment variable before running `yarn start`
or `yarn build` if the API lives on a different domain than the docs (for
example, `AGRINET_REGISTRY_URL=https://registry.example.org`). Docusaurus
embeds this value at build time, so redeploy the site after changing it.

### Authentication & CORS

Write operations are disabled unless you provide a shared secret via
`REGISTRY_WRITE_TOKEN`. Clients must send this token in an `Authorization`
header (Bearer token) or an `x-api-key` header when calling `POST`, `PUT`, or
`DELETE` endpoints. Configure the optional `REGISTRY_READ_ORIGINS` and
`REGISTRY_WRITE_ORIGINS` environment variables (comma-separated lists) to
restrict which browsers may call the read or write APIs. By default reads allow
any origin and writes only respond to same-origin requests.

Example of registering a node and sending a heartbeat with a token stored in
`$REGISTRY_WRITE_TOKEN`:

```bash
curl -H "Authorization: Bearer $REGISTRY_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4000/api/nodes \
  -d '{
    "type": "Feature",
    "properties": {
      "node_name": "Example node",
      "contact_email": "ops@example.org"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [36.82, -1.29]
    }
  }'

curl -H "Authorization: Bearer $REGISTRY_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -X PUT http://localhost:4000/api/nodes/example-node/ping \
  -d '{"last_seen": "2025-01-01T00:00:00Z"}'
```

Nodes can register themselves with `POST /api/nodes`, send heartbeat updates via
`PUT /api/nodes/:id/ping`, and map clients consume the `GET /api/nodes`
endpoint. The server persists data to `server/nodes.json` using atomic file
writes and also seeds from `static/data/global_map_layer.geojson` if no
database has been created yet.

### Rate limiting

Write operations are throttled to 120 requests per minute (per token/IP) by
default. Tune this by setting `REGISTRY_RATE_LIMIT_MAX_WRITES` and
`REGISTRY_RATE_LIMIT_WINDOW_MS` (milliseconds) when launching the registry. Set
`REGISTRY_RATE_LIMIT_MAX_WRITES=0` to disable rate limiting entirely.

### Tests

Run the registry smoke tests with:

```bash
yarn test
```
