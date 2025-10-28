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

Set the `AGRINET_REGISTRY_URL` environment variable at build/runtime if the API
lives on a different domain than the docs (for example,
`AGRINET_REGISTRY_URL=https://registry.example.org`). Nodes can register
themselves with `POST /api/nodes`, send heartbeat updates via
`PUT /api/nodes/:id/ping`, and map clients consume the `GET /api/nodes`
endpoint.
