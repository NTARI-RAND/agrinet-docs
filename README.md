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

## Search configuration

The site bundles a local documentation search that works without any external services so local development and preview deployments always include a working search bar. When real Algolia DocSearch credentials are present we automatically switch to Algolia. Ask AI is now configured separately so you can enable Algolia search without Ask AI or vice versa, depending on the credentials you supply. The Algolia-powered experience adopts a React.dev-inspired pill trigger with a dedicated Ask AI badge so visitors immediately discover when conversational answers are available.

Create a `.env` file (or export the variables in your shell) with the following values to enable Algolia search and Ask AI:

```bash
ALGOLIA_APP_ID="..."
ALGOLIA_API_KEY="..."          # Search-only API key
ALGOLIA_INDEX_NAME="..."

# Optional Ask AI configuration
ALGOLIA_ASSISTANT_ID="..."     # Algolia Ask AI assistant identifier

# Optional overrides if your Ask AI integration uses a dedicated application or index
# ALGOLIA_AI_APP_ID="..."
# ALGOLIA_AI_API_KEY="..."
# ALGOLIA_AI_INDEX_NAME="..."
```

Only set the Ask AI variables when your DocSearch application is configured for the experience; otherwise they can be left unset. Without the variables, the site keeps using the bundled local documentation search (or Algolia, if those credentials are provided) without attempting to activate Ask AI. When both the Algolia credentials and an Ask AI assistant are present, the configuration automatically wires the assistant into DocSearch so the modal can surface the conversational panel just like the React.dev experience. Leaving the Ask AI fields empty while still providing Algolia credentials yields the traditional DocSearch-only UI.
