# Agrinet Translation Guidelines

This repository folder collects the shared guidelines and helper scripts that support every
community-led Agrinet translation project.

## What's inside

- `check-status.mjs` – example script that compares the English docs against a language branch and
  reports outdated pages.
- `sync-content.mjs` – automates pulling the latest Agrinet docs into your translation workspace.
- `terminology-glossary.csv` – collaboratively maintained glossary that keeps product terms
  consistent across languages.

> **Tip:** If you build additional automation for your language team, please contribute it here so
> the entire community benefits.

## Getting started

1. Clone your language's translation repository.
2. Copy the scripts from this folder into a local `tools/` directory inside your repo.
3. Run `node tools/check-status.mjs` to identify pages that need attention.
4. Use `node tools/sync-content.mjs` after every Agrinet release to keep your translation current.

For complete contribution expectations, visit the Agrinet documentation site at
`/community/translations`.
