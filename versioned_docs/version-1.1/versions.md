---
id: versions
title: Versions
sidebar_label: Versions
description: Find the right Agrinet documentation release and learn how to publish future versions.
---

# Versions

You are viewing the **Agrinet Docs 1.1** snapshot. Use this page to find the right documentation set for your release and follow the workflow for publishing future versions.

- Current (stable): **1.1.0 (Nov 2, 2025)**  
  - Snapshot: /version-1.1/  
  - Release notes: https://github.com/NTARI-RAND/Agrinet/releases/tag/v1.1.0  
  - Highlights:
    - Versioned docs snapshot: version-1.1 (under `versioned_docs/version-1.1`)
    - New/updated guides: Quickstart, Federation, Payments, Chat UI
    - API Testing Playbook added (service ports, example scripts, troubleshooting)
    - Sidebar snapshots for the 1.1 docs set included
  - Use this if you are running Agrinet 1.1.x in production and want stable, pinned documentation.

- Next (unreleased): **Next**  
  - Editable source: `/docs/` (the "Next" version is always the live-editable docs)  
  - Use this if you want the most recent docs under active development. Note that content under "Next" may change without a versioned snapshot.

Older versions
- (No archived versions beyond 1.1.0 are published yet.)  
  - To add an archived version, create a versioned snapshot (`npx docusaurus docs:version <x.y>`) and add a release with release notes. Then list it here with its release date, changelog, and link to `/version-<x.y>/`.

How to use these docs
- If you are running Agrinet v1.1.x, use the "1.1" version in the Docusaurus version dropdown or browse the versioned docs at `/version-1.1/`.
- If you are contributing documentation for future releases, edit files in `docs/` (these feed the "Next" version). To create a new versioned snapshot, run:

```bash
# generate a new docs snapshot (run from repo root)
npx docusaurus docs:version 1.2
git add versioned_docs versioned_sidebars versions.json
git commit -m "chore(docs): version 1.2"
git push origin <publish-branch>
```

- To preview locally:

```bash
# dev preview
npx docusaurus start

# or build & serve
npx docusaurus build
npx serve -s build
```

Release & changelog practices
- Tag releases in the code repo using semantic versioning (vMAJOR.MINOR.PATCH). For example:

```bash
git tag -a v1.1.0 -m "Agrinet Docs v1.1.0 (Nov 2, 2025)"
git push origin v1.1.0
```

- Publish a GitHub Release with a detailed release body (migration notes, notable changes, links to docs) and link that release from this page. Example release URL:
  - https://github.com/NTARI-RAND/Agrinet/releases/tag/v1.1.0

Upgrade & migration notes (brief)
- Versioning semantics:
  - PATCH: backward-compatible bug fixes
  - MINOR: backward-compatible feature additions
  - MAJOR: breaking changes
- Ensure the publishing branch contains:
  - `versions.json` with `"1.1"` listed
  - `versioned_docs/version-1.1/`
  - `versioned_sidebars/version-1.1-sidebars.json`
- After merging those files to the publishing branch, run your normal build/deploy flow to publish the updated dropdown and pages.

Maintainers
- Docusaurus expects the `versions.json` file and matching `versioned_docs/` and `versioned_sidebars/` folders for each listed version. If a version does not appear in the UI, verify these files are committed to the publishing branch and redeploy.

Contributors & credits
Thanks to all Agrinet Docs contributors and maintainers who made v1.1.0 possible.
