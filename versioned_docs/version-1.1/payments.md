---
title: Payments & Financial Tools
sidebar_position: 5
---

Handle deposits, automated payouts, and fiat on/off ramps through the Agrinet financial toolkit. This guide documents core APIs, settlement flows, and configuration requirements.

## Components

| Feature | Description | Key Files |
| --- | --- | --- |
| Deposits | Fund NTARI accounts and escrow balances. | `backend/routes/depositRoutes.js` |
| Payouts | Automate transfers to producers and service providers. | `backend/routes/admin/payoutRoutes.js` |
| Stripe integration | Optional fiat bridge for card and bank payments. | `backend/README.md` (`STRIPE_KEY`) |
| Ledger & audits | Track transactions, LBTAS references, and notifications. | `docs/federation-guide.md`, `transactionLog.js` |

## Environment Configuration

```env
NTARI_LEDGER_ACCOUNT="ntari-platform"
STRIPE_KEY="sk_test_..."
PAYOUTS_WEBHOOK_SECRET="whsec_..."
DEPOSIT_MIN_AMOUNT=1000
PAYOUT_MIN_AMOUNT=500
```

Set `STRIPE_KEY` only when using Stripe; otherwise the deposit route relies on direct ledger credits.

## Deposits

### Create Deposit

`POST /deposit`

```json
{
  "userId": "user_buyer1",
  "amount": 250000,
  "currency": "KES",
  "method": "mpesa",
  "reference": "MPESA-12345",
  "metadata": {
    "contractId": "contract_45ab"
  }
}
```

Response contains deposit status (`pending`, `confirmed`, `failed`) and ledger entry IDs. For Stripe payments, include `paymentMethodId` in the payload and redirect clients to Stripe's confirmation flow.

### Confirm Deposit

`POST /deposit/:depositId/confirm`

```json
{
  "confirmedBy": "admin_ops",
  "evidenceUrl": "https://cdn.example.org/uploads/receipt-45ab.jpg"
}
```

## Payouts

### Schedule Payout

`POST /payouts`

```json
{
  "userId": "user_prod7",
  "amount": 180000,
  "currency": "KES",
  "destination": {
    "type": "mpesa",
    "account": "+255700123456"
  },
  "contractId": "contract_45ab"
}
```

The request enqueues a payout job. Admins can trigger batch processing via:

`POST /admin/payouts/run`

Response includes job IDs and summary counts (`processed`, `failed`, `queued`).

### Webhook Handling

When Stripe is enabled, configure webhook URLs (e.g., `/payments/stripe/webhook`) to acknowledge transfer events. Validate signatures with `PAYOUTS_WEBHOOK_SECRET`.

## Reconciliation & Reporting

- Review transaction history with `GET /transactions?userId=user_prod7`.
- Issue LBTAS ratings after settlement using `POST /submitRating` to maintain trust scores.
- Publish payout statuses to `/notifications` and SSE streams for real-time visibility.
- Export settlement summaries through federation trends or admin dashboards.

## Error Handling

Common error codes:

| HTTP Code | Meaning | Action |
| --- | --- | --- |
| 400 | Validation failure (amount below minimum, missing fields). | Adjust payload to meet constraints. |
| 401 | Unauthorized (missing JWT/API key). | Provide valid credentials. |
| 402 | Payment required (Stripe declined). | Retry with new payment method. |
| 409 | Duplicate reference ID. | Use unique `reference` per deposit. |
| 503 | Payout worker offline. | Restart BullMQ worker or Docker service. |

Audit every payout with ledger snapshots and store copies of receipts in `/uploads` for compliance.
