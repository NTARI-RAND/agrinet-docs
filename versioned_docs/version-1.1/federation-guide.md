---
title: Federation Deployment & Operations
sidebar_position: 7
---

The Agrinet federation network links regional marketplaces, co-ops, and partner nodes into a shared commerce layer. This guide merges the original deployment launch kit with the new operations runbook so operators have one place to review prerequisites, onboarding flows, synchronization jobs, and compliance guardrails.

## System Requirements

- Ubuntu 20.04+ (x86_64 or ARM) host or compatible Linux distribution.
- Node.js v18+ for API servers and worker processes.
- AWS DynamoDB (cloud-hosted or Local) for listings, contracts, conversations, and federation metadata.
- Git for pulling updates and managing configuration.
- PM2 or systemd to supervise long-running services.
- Optional: Nginx reverse proxy for TLS termination, Redis for BullMQ queues, and Docker if you prefer containerized workers.

## Environment & Credentials

Configure the core environment variables before starting any service or worker:

```env
JWT_SECRET="<random-string>"
API_KEY="<federation-api-key>"
AWS_REGION="<region>"
AWS_ACCESS_KEY_ID="<key>"
AWS_SECRET_ACCESS_KEY="<secret>"
DYNAMODB_ENDPOINT="http://dynamodb-local:8000" # optional for local dev
FEDERATION_WEBHOOK_SECRET="<shared-secret>"
STRIPE_KEY="<sk_live_or_test>"            # optional for payouts
```

Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`) enable SMS queue workers, while OAuth2 client IDs unlock admin dashboards. Rotate keys regularly and follow the repository `SECURITY.md` guidelines when reporting vulnerabilities.

## Deployment Bootstrap Script

Use the following script to provision a production-ready node:

```bash title="install.sh"
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

Schedule recurring federation syncs with cron or your scheduler of choice:

```bash
*/30 * * * * curl -s "$BACKEND_URL/federation/sync"
```

Set `BACKEND_URL` to the publicly reachable backend URL. The cron job keeps your node aligned with peers.

## Core Capabilities & Architecture

- **Node registry & sync**: Register nodes, pull peer exports, and exchange data via the Open Dialog and Mycelium modules.
- **Compliance enforcement**: Apply federation rules, LBTAS trust scoring, and audit logging to every synchronized transaction.
- **Analytics sharing**: Publish `/trends` insights powered by `aiTrendHelper` for regional monitoring.
- **Background workers**: Run `federation-sync`, key-expiry cleaners, SMS dispatchers, and notification broadcasters.

## Registration & Discovery Workflow

| Action | Endpoint | Example |
| --- | --- | --- |
| Register a node | `POST /federation/node/register` | `{ "nodeUrl": "https://node.example.org", "region": "West Africa", "contactEmail": "ops@node.org" }` |
| View nodes | `GET /federation/nodes` | Returns node metadata, sync status, region, and trust score. |
| Export catalog | `GET /federation/export` | Streams listings, contracts, and trend snapshots from the local node. |
| Pull peer export | `POST /federation/pull` | Body: `{ "sourceUrl": "https://peer.example.net" }` to trigger a sync job. |

Every registration is signed with the requesting node's API key. Store TLS fingerprints per peer and require OAuth2 tokens for operator dashboards.

## Synchronization & Background Jobs

1. Launch the federation worker (`node workers/federationSyncJob.js`) or the Docker Compose service `federation-sync`.
2. The worker polls `/federation/nodes`, enqueues BullMQ jobs, and fetches `/federation/export` payloads from peers.
3. Jobs validate hashes, merge listings/contracts, and record progress in the notifications table.
4. SSE channels (`/events`, `/stream/:conversationId`) broadcast sync updates to dashboards and chat threads.

Open Dialog negotiates conflict resolution with timestamped CRDT payloads; Mycelium handles fine-grained deltas.

## Security Handshake & Compliance Checklist

- Use verified TLS for every node exchange and retain the last received hash per peer.
- Synchronize only with registered nodes and track reliability through the LBTAS trust layer.
- Log dialog transcripts via `transactionLog.js` to support audits.
- Post LBTAS ratings for each contract settlement through `POST /submitRating`.
- Apply geofencing with helpers in `backend/utils/geo.js` before importing listings.
- Run the key-expiry cleaner to purge stale tokens and prevent unauthorized pushes.
- Honor repository licensing (GPL v3.0) and follow governance rules documented for federation operators.

## Trends & Analytics Sharing

```bash
curl -H "Authorization: Bearer <token>" https://api.example.org/trends?region=global
```

Example response:

```json
{
  "summary": "Maize prices up 12% week-over-week in Lake Zone.",
  "topSignals": [
    { "commodity": "maize", "changePct": 12, "confidence": 0.83 }
  ],
  "generatedBy": "aiTrendHelper"
}
```

Publish anonymized transaction counts and pricing data on a set cadence or via DynamoDB streams to keep partners informed.

## Troubleshooting Playbook

- **Sync drift:** Re-run `POST /federation/pull` with a `force` flag to rebuild the catalog.
- **Job backlog:** Inspect BullMQ queues (for example, `federationQueue`) and scale worker replicas.
- **Auth failures:** Rotate JWT secrets and confirm API keys through `/api/keys` admin routes.
- **Data mismatch:** Check schema versions advertised in registry metadata before accepting payloads.

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
┌─────────────────────────────┬────────────┬───────────┬──────────────┬─────────┬───────────────┐
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

For day-to-day runbooks and troubleshooting, pair this guide with the focused [Federation Node Guide](federation-node-guide.md) that breaks down worker scheduling, analytics sharing, and compliance workflows in even greater depth.
