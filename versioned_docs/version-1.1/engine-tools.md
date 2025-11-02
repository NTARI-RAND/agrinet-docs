---
title: Agrinet Engine Tooling Overview
sidebar_position: 2
---

The Agrinet Engine combines the core marketplace backend with real-time communications, federation services, and operator tooling. Use this reference to see every major runtime, framework, integration, and utility module in one place, along with the repository paths that document how each piece is used.

## Platform & Runtime

- **Node.js** powers the backend services, workers, and documentation tooling, and is required for local development. 【F:docs/quickstart.md†L10-L46】【F:docs/federation-guide.md†L10-L55】
- **Next.js & React** deliver the primary web application and chat experience that consume the backend APIs. 【F:docs/api-testing.md†L11-L16】【F:docs/chat-ui.md†L92-L120】

## Server, Web, & Realtime Transport

- **Express-style REST routing** exposes marketplace, payments, federation, and admin endpoints under `backend/routes/*`. 【F:docs/marketplace-api.md†L9-L128】【F:docs/payments.md†L9-L65】
- **Server-Sent Events (SSE)** stream live chat activity, notifications, and job updates through `/stream/:conversationId` and `/events`. 【F:docs/chat-sse.md†L40-L87】【F:docs/federation-guide.md†L81-L88】
- **Webhook & PING flows** capture production progress and contract milestones via dedicated REST and SSE hooks. 【F:docs/marketplace-api.md†L129-L173】

## Datastore & Persistence

- **Amazon DynamoDB** stores listings, contracts, messaging history, and federation metadata for both cloud and local deployments. 【F:docs/quickstart.md†L12-L20】【F:docs/federation-guide.md†L10-L88】【F:docs/sms-setup.md†L57-L60】
- **File uploads** under `/uploads` retain media shared through chat, marketplace listings, and settlement receipts. 【F:docs/chat-sse.md†L36-L61】【F:docs/marketplace-api.md†L83-L128】【F:docs/payments.md†L31-L65】

## Authentication, Keys, & Security

- **OAuth2 & JWT authentication** secure user-facing routes and federation dashboards. 【F:docs/chat-sse.md†L109-L122】【F:docs/federation-guide.md†L19-L33】
- **McEliese key cryptography** governs streaming limits, SSE access, and machine-issued tokens via `/api/keys`. 【F:docs/quickstart.md†L104-L120】
- **Security reporting** follows repository guidance in `SECURITY.md` for vulnerability intake and audit logging. 【F:docs/federation-guide.md†L32-L33】【F:docs/federation-guide.md†L90-L98】

## Third-party Services & Integrations

- **Stripe** handles fiat deposits, payouts, and webhook confirmations when enabled. 【F:docs/payments.md†L9-L65】【F:docs/federation-guide.md†L24-L29】
- **Twilio Programmable SMS** provides SMS intake, queuing, and delivery receipts for offline users. 【F:docs/sms-setup.md†L6-L83】【F:docs/quickstart.md†L15-L121】
- **External AI responders** plug in via `backend/services/openAIResponder.js` alongside the built-in Agrinet responder. 【F:docs/chat-sse.md†L88-L108】

## Developer Tooling & Frontend Styling

- **Tailwind CSS** styles the chat UI via the frontend bundle, with theming hooks documented for tenant customization. 【F:docs/chat-ui.md†L17-L24】
- **CLI utilities** such as `list-hardcoded-urls.sh` assist with repository maintenance and configuration validation. 【F:docs/quickstart.md†L115-L129】

## Testing & Quality Assurance

- **node:test & node:assert** exercise backend services and responders, mirroring CI workflows. 【F:docs/quickstart.md†L123-L131】
- **Docker Compose & local DynamoDB** support integration testing without touching production data. 【F:docs/quickstart.md†L12-L46】【F:docs/federation-guide.md†L10-L88】

## Analytics, AI Helpers, & Federation

- **aiTrendHelper** and `/trends` endpoints summarize local analytics for federation partners. 【F:docs/federation-guide.md†L63-L118】
- **Open Dialog & Mycelium sync modules** manage peer coordination and conflict resolution between federation nodes. 【F:docs/federation-guide.md†L63-L88】

## Domain Utilities & Background Services

- **Geo utilities** (`backend/utils/geo.js`) enable geofencing and proximity search across listings and contracts. 【F:docs/marketplace-api.md†L57-L127】【F:docs/federation-guide.md†L90-L98】
- **Square-foot gardening planner** (`backend/utils/squareFootGardening`) computes planting layouts and compatibility charts for extension teams. 【F:docs/quickstart.md†L115-L129】
- **Job queues & BullMQ workers** drive SMS delivery, federation sync, key expiry cleanup, and notification fan-out. 【F:docs/sms-setup.md†L57-L83】【F:docs/federation-guide.md†L63-L88】
- **Notification emitters** publish contract progress and job status into SSE streams and database records. 【F:docs/chat-sse.md†L70-L108】【F:docs/marketplace-api.md†L129-L173】

## npm Dependency Reference

The Agrinet Engine repositories expose their full dependency manifests for transparency and reproducibility. Regenerate these tables whenever the manifests change.

### Backend (`backend/package.json`)

| Package | Version | Purpose |
| --- | --- | --- |
| `aws-sdk` | ^2.1485.0 | DynamoDB client and AWS integrations. |
| `axios` | ^1.6.8 | HTTP client for federation pulls and external webhooks. |
| `bcryptjs` | ^2.4.3 | Password hashing for user registration. |
| `bullmq` | ^4.15.0 | Job queues for SMS, federation, and key expiry workers. |
| `compression` | ^1.7.4 | HTTP response compression. |
| `cors` | ^2.8.5 | Cross-origin resource sharing controls. |
| `dotenv` | ^16.4.1 | Environment variable loading. |
| `express` | ^4.19.2 | Primary HTTP API framework. |
| `jsonwebtoken` | ^9.0.2 | JWT creation and verification. |
| `multer` | ^1.4.5-lts.1 | Multipart uploads for chat attachments and receipts. |
| `node-fetch` | ^3.3.2 | Fetch API for server-side integrations. |
| `stripe` | ^13.10.0 | Stripe payments SDK. |
| `twilio` | ^4.19.0 | Twilio SMS API client. |
| `uuid` | ^9.0.1 | UUID generation for resources. |
| `ws` | ^8.16.0 | WebSocket transport for optional realtime adapters. |

### Frontend (`frontend/package.json`)

| Package | Version | Purpose |
| --- | --- | --- |
| `next` | ^14.1.0 | Application framework for the Agrinet portal. |
| `react` | ^18.2.0 | UI library for components. |
| `react-dom` | ^18.2.0 | DOM bindings for React. |
| `axios` | ^1.6.8 | REST client for marketplace and chat calls. |
| `swr` | ^2.2.0 | Data fetching and caching hooks. |
| `@agrinet/chat-ui` | ^1.4.0 | Shared chat interface package. |
| `@agrinet/sdk` | ^1.2.0 | Official client for Agrinet APIs. |
| `tailwindcss` | ^3.4.1 | Utility-first styling for frontend components. |
| `postcss` | ^8.4.33 | CSS processing pipeline. |
| `autoprefixer` | ^10.4.16 | Vendor prefixing for Tailwind/PostCSS builds. |

### Generating Updated Tables

```bash
node -e "const pkg=require('./backend/package.json'); console.table(pkg.dependencies)"    # backend
node -e "const pkg=require('./frontend/package.json'); console.table(pkg.dependencies)"  # frontend
```

Commit regenerated tables alongside any manifest change so operators always see current tooling details.
