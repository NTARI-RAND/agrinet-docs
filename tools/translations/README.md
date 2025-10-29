# Agrinet Translation Guidelines

This repository folder collects the shared guidelines and helper scripts that support every
community-led Agrinet translation project.

## What's inside

- `check-status.mjs` – example script that compares the English docs against a language branch and
  reports outdated pages.
- `sync-content.mjs` – automates pulling the latest Agrinet docs into your translation workspace.
- `terminology-glossary.csv` – collaboratively maintained glossary that keeps product terms
  consistent across languages.
- `bootstrap-locales.mjs` – runs `docusaurus write-translations` for every configured locale so
  translators can start from fresh string catalogs (see the
  [internationalization overview](https://docusaurus.io/docs/i18n/introduction) and
  [tutorial](https://docusaurus.io/docs/i18n/tutorial)).
- `build-locales.mjs` – sequentially executes `docusaurus build --locale <code>` for each language to
  confirm static assets exist before deploying (aligns with the
  [Git deployment guidance](https://docusaurus.io/docs/i18n/git)).

> **Tip:** If you build additional automation for your language team, please contribute it here so
> the entire community benefits.

## Getting started

1. Clone your language's translation repository.
2. Copy the scripts from this folder into a local `tools/` directory inside your repo.
3. Run `node tools/translations/bootstrap-locales.mjs` to extract the latest UI strings and docs
   content for each locale you intend to support. Commit the generated files under `i18n/` so every
   language advertised in `docusaurus.config.js` has source material for translators. If you
   coordinate via Crowdin or another platform, wire it up following the
   [Crowdin integration guide](https://docusaurus.io/docs/i18n/crowdin).
4. Translate the generated JSON and Markdown files (either manually or through your localization
   platform) and run `node tools/translations/build-locales.mjs` to produce the localized static
   bundles. Deploy the directories in `build/<locale>/` so routes such as `/fr/` resolve correctly.
5. Use `node tools/check-status.mjs` to identify pages that need attention.
6. Run `node tools/sync-content.mjs` after every Agrinet release to keep your translation current.

> **Tip:** When multiple teams collaborate on the same language, follow the branching recommendations
> in the [i18n Git workflow](https://docusaurus.io/docs/i18n/git) so translation updates stay easy to
> review.

For complete contribution expectations, visit the Agrinet documentation site at
`/community/translations`.