---
title: Marketplace API Guide
sidebar_position: 2
---

The marketplace module powers product catalogs, service listings, and supply contracts for producers, buyers, and service providers. This reference captures the primary REST endpoints, request bodies, and expected responses.

## Authentication

All requests require either a JWT bearer token or an API key header:

```http
Authorization: Bearer <jwt>
x-api-key: <service-key> # required for system-to-system calls and SSE
```

Use `POST /api/auth/login` to obtain JWTs after registering with `POST /userRegistration`.

## Products

Create reusable products that can be attached to listings and contracts.

### Create Product

`POST /products`

```json
{
  "name": "Grade A Maize",
  "category": "grain",
  "unit": "kg",
  "basePrice": 450,
  "attributes": {
    "variety": "Pioneer 30G99",
    "organic": true
  }
}
```

Response:

```json
{
  "productId": "prod_9d9f",
  "createdAt": "2025-03-01T09:15:00.123Z"
}
```

### List Products

`GET /products?q=maize&category=grain`

Query parameters:

- `q` — full-text search across name, description, and tags.
- `category` — filter by commodity or service group.
- `geoLat_`, `geoLong_`, `radiusKm` — apply geo-fencing using helpers in `backend/utils/geo.js`.

Returns paginated results with inventory counts and availability flags.

## Listings

Listings represent offers made visible to marketplace visitors.

### Create Listing

`POST /listings`

```json
{
  "productId": "prod_9d9f",
  "type": "offer",
  "quantity": 1000,
  "unit": "kg",
  "price": 480,
  "currency": "KES",
  "location": "Kisumu, KE",
  "geoLat_": "-0.1023",
  "geoLong_": "34.7617",
  "images": ["https://cdn.example.org/uploads/maize-bag.jpg"],
  "notes": "Moisture < 13%"
}
```

Response includes `listingId`, `status`, and timestamps.

### Search Listings

`GET /listings?type=offer&radiusKm=50&geoLat_=-0.10&geoLong_=34.76`

Supports filters for `type` (offer/request), `status`, `productId`, `ownerId`, and location radius.

### Update Listing

`PATCH /listings/:listingId`

```json
{
  "status": "reserved",
  "quantity": 600,
  "price": 470
}
```

Use `DELETE /listings/:listingId` to retire expired or fulfilled postings. Uploaded images are stored under `/uploads` and can be retrieved via `GET /uploads/<filename>`.

## Contracts

Contracts manage procurement or supply requests between producers and buyers.

### Create Contract

`POST /contracts`

```json
{
  "title": "School Feeding Supply",
  "buyerId": "user_buyer1",
  "supplierId": "user_prod7",
  "productId": "prod_9d9f",
  "quantity": 2000,
  "unit": "kg",
  "price": 460,
  "currency": "KES",
  "deliveryWindow": {
    "start": "2025-04-01",
    "end": "2025-04-15"
  },
  "terms": [
    "Moisture below 13%",
    "LBTAS rating above 4.0"
  ]
}
```

### Accept Contract

`POST /contracts/:contractId/accept`

```json
{
  "acceptedBy": "user_prod7",
  "message": "Ready to deliver in two shipments"
}
```

### Report Progress (PING)

`POST /contracts/:contractId/pings`

```json
{
  "status": "in_transit",
  "percentComplete": 55,
  "notes": "Truck departed depot",
  "attachments": ["https://cdn.example.org/uploads/waybill-123.pdf"]
}
```

Each ping triggers notifications and SSE events for subscribed buyers.

### Submit LBTAS Rating

`POST /submitRating`

```json
{
  "contractId": "contract_45ab",
  "from": "user_buyer1",
  "to": "user_prod7",
  "score": 4.5,
  "comment": "Delivered on time with proper packaging",
  "tags": ["punctual", "quality"]
}
```

Ratings feed the reputation ledger and are accessible from transaction detail pages.

## Geo & Analytics Helpers

- Include `geoLat_`/`geoLong_` when creating listings to enable distance queries.
- Use `/trends` for aggregated pricing signals and `/transactions/:id` to audit progress history.
- Combine `/products`, `/listings`, and `/contracts` filters to build dashboards for buyers and producers.

Refer to the Payments and Notifications guides for settlement workflows and SSE delivery patterns that complement the marketplace APIs.
