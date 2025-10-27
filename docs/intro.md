---
slug: /
title: Welcome to Agrinet
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial Intro

Welcome to the interactive documentation hub for Agrinet! This site is built with [Docusaurus](https://docusaurus.io/) so that your teams can explore, search, and contribute to Agrinet knowledge in a delightful way.

:::tip
If you are new to Docusaurus, the official [installation guide](https://docusaurus.io/docs/installation) and the [interactive tutorial](https://tutorial.docusaurus.io/docs/intro) are excellent starting points.
:::

## Discover Agrinet

Agrinet connects growers, service partners, and data providers in a unified ecosystem. Use the navigation to learn how to onboard new organizations, integrate services, and validate APIs. Get started by **creating a new node**.

<Tabs>
  <TabItem value="start" label="Get set up">

Review the [Onboarding guide](onboarding) to learn how to provision environments, invite team members, and configure federated identity.

  </TabItem>
  <TabItem value="integrate" label="Integrate services">

Follow the [Federation guide](federation-guide) for details on linking external providers and managing schema updates.

  </TabItem>
  <TabItem value="test" label="Validate APIs">

Use the [API testing playbook](api-testing) to verify that every service contract behaves as expected before launch.

  </TabItem>
</Tabs>

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 20.0 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.

## Generate a new node

The classic template will automatically be added to your project after you run the command:

```bash
npm init docusaurus@latest my-website classic
```

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Docusaurus.

## Start your node

Run the development server:

```bash
cd my-node
npm run start
```

The `cd` command changes the directory you're working with. In order to work with your newly created Docusaurus site, you'll need to navigate the terminal there.

The `npm run start` command builds your website locally and serves it through a development server, ready for you to view at http://localhost:3000/.

Open `docs/intro.md` (this page) and edit some lines: the site **reloads automatically** and displays your changes.

## Learn by building

- Experiment in the [Docusaurus playground](https://docusaurus.io/docs/playground) to prototype new Agrinet docs layouts.
- Explore polished documentation from the [Docusaurus showcase](https://docusaurus.io/showcase?tags=favorite) and adapt ideas for your own teams.
- Fork the [classic template on CodeSandbox](https://codesandbox.io/p/sandbox/github/facebook/docusaurus/tree/main/examples/classic?privacy=public) to preview your changes before merging.

Happy documenting!
