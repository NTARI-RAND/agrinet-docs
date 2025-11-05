---
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

Follow the [Federation guide](federation-node-guide) for details on linking external providers and managing schema updates.

  </TabItem>
  <TabItem value="test" label="Validate APIs">

Use the [API testing playbook](api-testing) to verify that every service contract behaves as expected before launch.

  </TabItem>
</Tabs>

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 20.0 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.
- A host for the Agrinet node (EC2 instance, VM, or bare-metal) with SSH access.
- Node.js (LTS — e.g., 18.x or newer), npm or yarn.
- Git (if you will clone the repository on the host).
- Ability to open the required ports in your host firewall / cloud security group.
- A mechanism to securely store the node private key (filesystem permissions, secrets manager, etc.).
- Familiarity with systemd or container tooling (Docker/Compose) for running services in production.

---

## Generate a new Agrinet node

This document shows a generic, repeatable flow for creating an Agrinet node and joining it to an Agrinet federation. The repository may provide scripts or a CLI to automate parts of this; check the “Repository specifics” section to discover repo-provided commands and adapt the steps below.

High-level steps:
1. Inspect the repo to find the app entrypoint and any built-in join/register commands.
2. Generate a node identity (keypair + node id).
3. Create the node configuration and place secrets securely.
4. Install/build the Agrinet code on the host.
5. Start the node (systemd, PM2, or Docker).
6. Register / Join the federation (API or peer bootstrap).
7. Verify node health and federation membership.

---

### 1) Repository specifics — find the right commands and entry point

On your laptop or the host, inspect the repo to determine the start script, available CLI commands, and any `join`/`register` functionality:

```bash
git clone https://github.com/NTARI-RAND/Agrinet.git
cd Agrinet

# show package scripts and entry point
cat package.json | jq .scripts
cat package.json | jq .main

# search the codebase for "join", "register", "bootstrap", or "federation"
rg "join|register|bootstrap|federat|peer" -S || grep -Rin "join\|register\|bootstrap\|federat\|peer" .
```

If the repository provides an explicit CLI (for example `npm run cli join`), prefer that over manual API calls — the CLI usually handles signing and validation for you.

---

### 2) Generate node identity (keypair + node id)

Agrinet nodes must have a unique cryptographic identity. Ed25519 is recommended for modern systems.

On the host (example paths shown — adjust to your environment):

```bash
sudo mkdir -p /opt/agrinet/keys
sudo chown $(whoami) /opt/agrinet/keys
ssh-keygen -t ed25519 -f /opt/agrinet/keys/node_ed25519 -N "" -C "agrinet-node-$(hostname)"
chmod 600 /opt/agrinet/keys/node_ed25519
chmod 644 /opt/agrinet/keys/node_ed25519.pub
```

Compute a node id (the repository may define the exact node-id format — often it's a hash of the public key):

```bash
# example: extract raw public key and compute a hex SHA256 node id
PUB_B64=$(awk '{print $2}' /opt/agrinet/keys/node_ed25519.pub)
echo $PUB_B64 | base64 -d | sha256sum | awk '{print $1}' > /opt/agrinet/keys/node_id
NODE_ID=$(cat /opt/agrinet/keys/node_id)
echo "Node ID: $NODE_ID"
```

Always check the repo docs or code to confirm the node id encoding expected by the federation controller.

---

### 3) Create configuration and environment variables

Agrinet instances commonly accept a `.env` or JSON config file. Example `.env` file:

```bash
# /opt/agrinet/.env
NODE_ENV=production
NODE_HOST=0.0.0.0
NODE_PORT=4000
PEER_PORT=7000
NODE_ID=<REPLACE_WITH_NODE_ID>
NODE_PRIVATE_KEY_PATH=/opt/agrinet/keys/node_ed25519
FEDERATION_API_URL=https://federation.example.org/api
LOG_LEVEL=info
```

If the repo expects `config.json` or another format, convert these values accordingly. Protect private keys by setting filesystem permissions and, for production, consider a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.).

---

### 4) Install and build the Agrinet code

On the host:

```bash
cd /opt
git clone https://github.com/NTARI-RAND/Agrinet.git
cd Agrinet
git checkout main

# install dependencies and build
npm ci
# if the repo uses a build step
npm run build || true
```

Note: replace `main` with the branch/tag you want to deploy.

---

### 5) Start the node (examples)

You can run the node directly for testing, or set it up under systemd or Docker for production.

Run directly (dev/test):

```bash
export $(cat /opt/agrinet/.env | xargs)
node ./dist/index.js    # or the main file specified by package.json
```

Systemd unit example:

```ini
# /etc/systemd/system/agrinet.service
[Unit]
Description=Agrinet node
After=network.target

[Service]
Type=simple
User=agrinet
WorkingDirectory=/opt/Agrinet
EnvironmentFile=/opt/agrinet/.env
ExecStart=/usr/bin/node /opt/Agrinet/dist/index.js
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Docker Compose example:

```yaml
# docker-compose.yml
version: "3.8"
services:
  agrinet:
    image: node:18
    working_dir: /app
    volumes:
      - ./Agrinet:/app:ro
      - /opt/agrinet/keys:/keys:ro
      - /opt/agrinet/.env:/app/.env:ro
    environment:
      - NODE_ENV=production
      - NODE_PRIVATE_KEY_PATH=/keys/node_ed25519
    command: ["node", "dist/index.js"]
    ports:
      - "4000:4000"
      - "7000:7000"
```

Start with systemd:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now agrinet
sudo journalctl -u agrinet -f
```

Or Docker:

```bash
docker-compose up -d
docker logs -f <container_id_or_name>
```

---

### 6) Register / join the federation

There are two common patterns. Use the repo-provided CLI or API if available.

A) Controller API registration (generic example):

```bash
curl -X POST "https://federation.example.org/api/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "node_id": "'"$NODE_ID"'",
    "public_key": "'"$(cat /opt/agrinet/keys/node_ed25519.pub)"'",
    "endpoint": "https://my-node.example.org:4000",
    "meta": {"name":"ec2-node-1","region":"us-east-1"}
  }'
```

B) Peer bootstrap (ask a known peer to add you):

```bash
curl -X POST "https://known-peer.example.org:4000/peers" \
  -H "Content-Type: application/json" \
  -d '{"node_id":"'$NODE_ID'", "endpoint":"https://my-node.example.org:4000", "public_key":"'"$(cat /opt/agrinet/keys/node_ed25519.pub)"'"}'
```

If the repo offers a CLI command like `npm run cli join -- --controller https://...`, use that — it will typically handle signing and validation.

---

### 7) Verify operation

- Check process status and logs:
  - systemd: sudo journalctl -u agrinet -f
  - docker: docker logs -f agrinet
- Health endpoint:
  - curl -sS http://localhost:4000/health
- Check listening ports:
  - ss -tulpn | grep -E "4000|7000"
- Confirm membership in federation:
  - Query the federation controller: GET /api/nodes or use the federation UI.
- Ensure last-seen/hearbeat timestamps update in the federation dashboard.

---

### 8) Security & networking notes

- Use TLS for external endpoints. Terminate TLS at a reverse proxy (nginx, AWS ALB) or run the node with TLS config.
- Limit open ports with security groups and firewall rules. Expose only what is necessary externally.
- Use strict file permissions for private keys (chmod 600) and run the node under a dedicated user.
- For production, prefer secrets manager for keys and credentials, and use IAM roles for cloud resources.

---

### 9) Troubleshooting checklist

- Node won't start:
  - Inspect logs for “missing key” or “permission denied”.
  - Confirm NODE_PRIVATE_KEY_PATH points to the private key and is readable by the service user.
- Node runs but doesn't show in federation:
  - Confirm registration POST returned success.
  - Check federation controller logs for rejection reasons (invalid key format, invalid node id).
- Networking issues:
  - Confirm security groups/firewall and that the service is listening on the expected host/port.
- Version mismatch:
  - On host: git rev-parse HEAD
  - Locally: git clone/fresh clone and compare commits or checksums.

---

### 10) How to keep this doc in sync and contribute changes

- Edit this page (docs/intro.md) in a feature branch and open a PR. We prefer clear step-by-step changes and small PRs for doc updates.
- When documentation depends on repository scripts or CLI upgrades, update the examples and commands here and add a short “Repository changes required” note in the PR.
- For repo-specific automation (e.g., `scripts/bootstrap-node.sh`), include the exact script usage here so operators can copy-paste safe commands.

---

### Quick repository discovery commands (recap)

```bash
# find the start file and scripts
cat package.json | jq .scripts
cat package.json | jq .main

# search for join/register functionality
rg "join|register|bootstrap|federat|peer" -S || grep -Rin "join\|register\|bootstrap\|federat\|peer" .

# check deployed commit on a host (if the host is a git clone)
git -C /opt/Agrinet rev-parse HEAD
```

---

Happy deploying! If you want to try:
- Produce a ready-to-deploy systemd unit and env file tailored to the Agrinet repo (You will just need the repository start script or `package.json` main).
- Generate a bootstrap script (keygen, config, build, start) that you can run on EC2 to automate node creation.
- Convert the registration example into the exact API payload for your federation controller if you add its API spec or sample.
