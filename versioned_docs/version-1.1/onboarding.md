---
title: Federation Node Onboarding
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

This guide walks you through the essentials for provisioning a new Agrinet federation node, syncing with the Mycelium network, generating McEliece keys, and wiring up a UI contract.

## Prerequisites

- Node.js (v14 or newer)
- Git
- Yarn or npm
- Access to the [repository](https://github.com/NTARI-RAND/Agrinet)

## Clone the Repository

```bash
git clone https://github.com/NTARI-RAND/Agrinet.git
cd Fruitful
```

## Install Dependencies

```bash
# With Yarn
yarn install

# Or with npm
npm install
```

## Sync with Mycelium

1. Create or update your `.env` file.
2. Add your node configuration:

```env
MYCELIUM_NODE_NAME=your-node-name
MYCELIUM_PEER_URLS=https://peer1.example.com,https://peer2.example.com
MYCELIUM_PORT=7000
```

3. Start the Mycelium node:

```bash
yarn mycelium:start
# or
npm run mycelium:start
```

:::note
Monitor the logs and confirm that the node connects to at least one peer.
:::

## Generate McEliece Keys

Agrinet uses the McEliece cryptosystem for secure federation traffic.

```bash
node scripts/gen-mceliece.js
```

If no script is available, create one with [`node-mceliece`](https://www.npmjs.com/package/node-mceliece):

```javascript title="scripts/gen-mceliece.js"
const mceliece = require("node-mceliece");
const fs = require("fs");

const { publicKey, privateKey } = mceliece.keyPair();
fs.writeFileSync("keys/mceliece_public.key", publicKey);
fs.writeFileSync("keys/mceliece_private.key", privateKey);

console.log("McEliece key pair generated in /keys/");
```

:::caution
Treat private keys as secrets and never commit them to version control.
:::

## Define a UI Contract

The UI contract captures how frontend clients interact with your federation node.

```javascript title="contracts/uiContract.js"
/**
 * UI Contract Example
 * Describes methods exposed to the UI for interacting with the federation node.
 */
module.exports = {
  authenticateUser: async (publicKey) => {
    // implementation
  },
  requestSync: async () => {
    // implementation
  },
  submitTransaction: async (transaction, signature) => {
    // implementation
  },
};
```

### Integrate with the Frontend

- Call `authenticateUser` with the McEliece public key.
- Trigger `requestSync` to keep data in sync via Mycelium.
- Use `submitTransaction` for writes that require federation consensus.

## Final Checklist

<Tabs>
  <TabItem value="tests" label="Run tests">
    <ul>
      <li>Execute end-to-end tests against at least one peer node.</li>
      <li>Confirm Mycelium log output reports a healthy connection.</li>
    </ul>
  </TabItem>
  <TabItem value="security" label="Secure keys">
    <ul>
      <li>Store generated keys in a secure secrets manager.</li>
      <li>Rotate credentials on a regular cadence.</li>
    </ul>
  </TabItem>
  <TabItem value="integration" label="Wire the UI">
    <ul>
      <li>Ensure your frontend calls the UI contract methods consistently.</li>
      <li>Document the API surface for downstream teams.</li>
    </ul>
  </TabItem>
</Tabs>

Welcome aboard the Agrinet federation! For questions, open an issue or reach out to the platform team.
