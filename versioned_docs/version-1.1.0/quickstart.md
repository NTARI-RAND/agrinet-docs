---
title: Agrinet Engine Quickstart
sidebar_position: 1
---

Get the Agrinet Engine running quickly for local demos, QA sessions, or onboarding new operators. This guide highlights system dependencies, install steps, and core capabilities available across the marketplace, communications, and federation layers.

## System Requirements

| Component | Version | Notes |
| --- | --- | --- |
| Node.js | ≥ 20.0 | Required by backend services and the Docusaurus docs site. |
| npm | ≥ 9 | Ships with Node 20. |
| DynamoDB Local | Optional | Enables offline testing of persistence flows. |
| Redis / BullMQ store | Optional | Needed when exercising background workers. |
| Twilio account | Optional | Required for SMS integrations. |

Install the documentation site dependencies with:

```bash
npm install
```

Key runtime packages and versions are tracked in `package.json`:

| Package | Version |
| --- | --- |
| `@docusaurus/core` | 3.9.2 |
| `@docusaurus/preset-classic` | 3.9.2 |
| `react` / `react-dom` | 19.0.0 |
| `leaflet` | 1.9.4 |
| `react-leaflet` | 5.0.0 |

## Environment Variables

Create a `.env` file in the backend project with the following baseline keys:

```env
PORT=5000
JWT_SECRET="super-secret"
API_KEY="da2-example"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="local"
AWS_SECRET_ACCESS_KEY="local"
DYNAMODB_ENDPOINT="http://localhost:8000"
STRIPE_KEY="sk_test_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_SMS_NUMBER="+15551234567"
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
```

Load the environment and start the services:

```bash
# backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

For docs and SDK previews:

```bash
npm run start
```

## Core User Flows

1. **Register a user** with `POST /userRegistration` to obtain profile and role metadata.
2. **Create inventory** through `/products` and `/listings` endpoints or the marketplace UI.
3. **Initiate contracts** with `/contracts` and track milestones via progress pings.
4. **Chat in real time** using `/conversations`, `/messages`, and SSE streams at `/stream/:conversationId`.
5. **Queue SMS updates** through `/sms/inbound` webhooks and `/sms/queue` for outbound delivery.
6. **Handle payments** with `/deposit`, `/payouts`, and optional Stripe integration.
7. **Sync nodes** using the federation tools in `/federation/*` and `/trends` APIs.

## User & Key Management APIs

```json title="POST /userRegistration"
{
  "email": "farmer@example.org",
  "password": "s3cure",
  "role": "producer",
  "profile": {
    "name": "Amina Odhiambo",
    "phone": "+255700123456"
  }
}
```

```json title="POST /api/auth/login"
{
  "email": "farmer@example.org",
  "password": "s3cure"
}
```

```json title="POST /api/keys/issue"
{
  "userId": "user_prod7",
  "scopes": ["sse:stream", "market:read"],
  "expiresIn": 86400
}
```

The key management service supports McEliese key generation and OAuth2 token exchange. Use `/api/keys/revoke` to deactivate compromised keys and `/api/auth/refresh` to rotate JWTs without forcing logouts.

## Tooling Overview

| Capability | Highlights | Key Endpoints |
| --- | --- | --- |
| Marketplace | Products, listings, contracts | `/products`, `/listings`, `/contracts` |
| User management | Registration, roles, keys | `/userRegistration`, `/api/auth/login`, `/api/keys` |
| Authentication | McEliese keys, OAuth2/JWT, SSE API keys | `/api/auth/*`, `/api/keys` |
| Chat & SSE | Conversations, responders, streaming updates | `/conversations`, `/messages`, `/stream/:conversationId`, `/events` |
| SMS | Twilio webhook intake, queueing, local language replies | `/sms/inbound`, `/sms/status`, `/sms/queue` |
| Payments | NTARI deposits, payouts, Stripe off-ramps | `/deposit`, `/payouts`, `/admin/payouts/run` |
| Reputation | LBTAS scoring, audits | `/submitRating`, `/transactions/:id` |
| Notifications | Pings, progress, SSE | `/transactions/:id/pings`, `/notifications` |
| Federation | Node registry, sync jobs, analytics | `/federation/*`, `/trends` |
| Geo tools | Geo-filtered search, distance calculations | `/listings?geoLat_=...&geoLong_=...` |
| Square-foot planning | Plant spacing calculator & companion planting guide | `backend/utils/squareFootGardening` |
| File uploads | Receipts, listing media | `/uploads`, `/messages/:id/files` |
| CLI & scripts | Hardcoded URL audits, registry sync | `scripts/list-hardcoded-urls.sh`, `server/registry-server.js` |
| Testing | Node test suite, Docker Compose for DynamoDB | `npm test`, `docker compose up dynamodb` |

Use this quickstart to bootstrap lab environments before diving into the detailed feature guides that follow.
