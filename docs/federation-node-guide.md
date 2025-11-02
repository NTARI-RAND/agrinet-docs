---
title: Federation Node Guide
sidebar_position: 6
---

The Agrinet federation layer links regional nodes, co-ops, and partner platforms into a shared marketplace with synchronized listings, analytics, and compliance monitoring. Pair this runbook with the consolidated [Federation Deployment & Operations](federation-guide.md) reference for provisioning checklists and governance requirements.

## Core Capabilities

- **Node registry & sync:** Register nodes, pull peer exports, and exchange data using the Open Dialog and Mycelium sync modules.
- **Compliance enforcement:** Apply federation rules, LBTAS trust scoring, and audit logging to every synchronized transaction.
- **Analytics sharing:** Publish market intelligence via `/trends` endpoints powered by the `aiTrendHelper` summarization pipeline.
- **Background workers:** Schedule `federation-sync` jobs alongside key expiry cleaners and notification emitters to keep nodes consistent.

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Node.js ≥ 20 | Matches backend runtime and supports worker threads. |
| DynamoDB (AWS or Local) | Stores listings, contracts, conversations, and federation metadata. |
| Redis or compatible BullMQ store | Powers job queues for federation sync, SMS, and key expiry tasks. |
| TLS certificates | Required for node registration trust validation. |
| Optional Stripe credentials | Enable fiat payouts during cross-node settlement. |

Set the following environment variables before starting workers:

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

## Registration & Discovery

| Action | Endpoint | Example |
| --- | --- | --- |
| Register a node | `POST /federation/node/register` | `{"nodeUrl":"https://node.example.org","region":"West Africa","contactEmail":"ops@node.org"}` |
| View nodes | `GET /federation/nodes` | Returns array of node metadata with sync status, region, and trust score. |
| Export catalog | `GET /federation/export` | Streams listings, contracts, and trend snapshots from the local node. |
| Pull peer export | `POST /federation/pull` | Body: `{ "sourceUrl": "https://peer.example.net" }` to trigger a sync job. |

Every registration is signed with the requesting node's API key. Store the node's TLS fingerprint and require OAuth2 tokens for operator dashboards.

## Synchronization Workflow

1. Schedule the background worker: `node workers/federationSyncJob.js` or run via Docker Compose service `federation-sync`.
2. Worker polls `/federation/nodes` and queues BullMQ jobs for each eligible peer.
3. Each job fetches `/federation/export` from the peer, validates hashes, and merges listings/contracts into the local datastore.
4. Progress is recorded in the notification table, enabling `/events` and `/stream/:conversationId` SSE channels to broadcast sync updates.

The Mycelium module handles fine-grained delta updates, while the Open Dialog module negotiates conflict resolution using timestamped CRDT payloads.

## Compliance Checklist

- Ensure every contract settlement posts an LBTAS rating via `POST /submitRating`.
- Retain dialog transcripts in `transactionLog.js` for audits.
- Apply geo-fencing filters on imported listings with helpers in `backend/utils/geo.js`.
- Purge expired keys with the key-expiry cleaner worker to prevent unauthorized federation pushes.
- Follow governance policies defined in `docs/federation-guide.md` and the repository `SECURITY.md`.

## Trends & Analytics Sharing

Expose aggregated insights for federation partners through the trends API:

```bash
curl -H "Authorization: Bearer <token>" https://api.example.org/trends?region=global
```

Response snippet:

```json
{
  "summary": "Maize prices up 12% week-over-week in Lake Zone.",
  "topSignals": [
    { "commodity": "maize", "changePct": 12, "confidence": 0.83 }
  ],
  "generatedBy": "aiTrendHelper"
}
```

Use DynamoDB streams or scheduled exports to publish anonymized transaction counts and pricing data.

## Troubleshooting

- **Sync drift:** Re-run `POST /federation/pull` with the `force` flag to rebuild the catalog from peers.
- **Job backlog:** Inspect BullMQ queues (e.g., `federationQueue`) and scale worker replicas.
- **Auth failures:** Rotate JWT secrets and confirm API keys are loaded via `/api/keys` admin routes.
- **Data mismatch:** Verify each node shares the same schema version indicated in the registry metadata.

For a complete operator runbook, combine this guide with the deployment quickstart and payments reference to ensure cross-node settlements reconcile correctly.
