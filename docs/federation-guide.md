---
title: Federation Deployment & Launch Kit
sidebar_position: 3
---

This launch kit equips Agrinet node operators with everything needed to deploy, federate, and contribute back to the network.

## System Requirements

- Ubuntu 20.04+ (x86_64 or ARM)
- Node.js v18+
- AWS DynamoDB 5+
- Git
- PM2 or systemd for process management
- Optional but recommended: Nginx reverse proxy for TLS termination

## Deployment Script

Use the following script to bootstrap a production-ready node:

```bash title='install.sh'
#!/bin/bash
sudo apt update && sudo apt install -y nodejs npm git dynamodb

git clone https://github.com/NTARI-RAND/Agrinet.git
cd Agrinet/backend

cp .env.example .env
npm install

# Setup PM2
npm install -g pm2
pm run build
pm start
pm save
```

For automated federation syncs, schedule a cron job:

```bash
*/30 * * * * curl -s '$BACKEND_URL/federation/sync'
```

:::note
Set `BACKEND_URL` to your deployed backend URL. The cron job keeps your node in sync with the broader federation.
:::

## Node Onboarding Checklist

1. Clone the protocol backend.
2. Configure `.env` with `JWT_SECRET`, `AWS_SECRET`, and optional `STRIPE_KEYS`.
3. Schedule `federationSyncJob.js` with PM2 or cron (`BACKEND_URL` must point to your backend).
4. Register with peers:

```bash
POST /federation/node/register
{
  'nodeUrl': 'https://node.example.org',
  'region': 'Pacific NW',
  'contactEmail': 'admin@node.org'
}
```

5. Verify sync status:

```bash
GET /federation/export
GET /federation/nodes
GET /logs
```

## Security Handshake (v1)

Every sync exchange includes:

- Node URL with verified TLS
- Hash-checked payload (timestamp-based CRDT logic)
- Optional: GPG-signed payloads (planned for v2)

**Trust model:** only synchronize with registered nodes and track reliability with the LBTAS trust layer.

```bash
GET /federation/export
# Ensure each item includes updatedAt and store the last received hash per node
```

## Compliance Rules

- Use the transmission string format `key1/key2/UI_string`.
- Store user data according to Agrinet key-auth standards.
- Implement both Open Dialog and Mycelium sync modules.
- Rate all transactions with the LBTAS scoring model.
- Honor the GNU GPL v3.0 license for all forks and contributions.

## Platform Features

Key modules shipped with the Agrinet backend include:

- `trendsRoutes.js` for AI-enhanced trend analytics.
- `depositRoutes.js` for wallet management and Stripe integrations.
- `agrotourismRoutes.js` for event and listing workflows.
- `transactionLog.js` for auditable activity.
- `aiTrendHelper.js` for rule-based AI summaries.

## Federation Status CLI

Monitor peer health with the bundled CLI:

```bash
cd frontend
node federationStatusCLI.js              # defaults to http://localhost:5000
BACKEND_URL=https://api.example.com node federationStatusCLI.js
```

Example output:

```
🌍 Federation Node Status Report
┌─────────────────────────────┬────────────┬───────────┬─────────────┬─────────┬───────────────┐
│ Node URL                    │ Status     │ Listings  │ Transactions │ Users   │ Last Sync     │
├─────────────────────────────┼────────────┼───────────┼──────────────┼─────────┼───────────────┤
│ http://node1.example.org    │ ✅ ONLINE  │ 123       │ 456          │ 10      │ 5/20/2025 ... │
│ http://node2.example.org    │ ❌ OFFLINE │ -         │ -            │ -       │ N/A           │
└─────────────────────────────┴────────────┴───────────┴──────────────┴─────────┴───────────────┘
```

Install dependencies if needed:

```bash
npm install chalk cli-table3 axios
```

## Appendix: Node Template

```json
{
  "nodeId": "node-1",
  "production": { "capabilities": [] },
  "services": {
    "educational": [],
    "socialMedia": [],
    "extension": [],
    "financial": {
      "marketListings": [],
      "grants": []
    },
    "marketing": {
      "onNetwork": [],
      "socialMediaSyndication": []
    },
    "messaging": {
      "enabled": false,
      "levesonRatings": []
    }
  },
  "reputation": { "leveson": 0 },
  "interoperability": []
}
```

You're now ready to launch your Agrinet node and collaborate with the federation community.
