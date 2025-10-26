---
title: API Testing Playbook
sidebar_position: 4
---

This playbook outlines how to validate Agrinet backend services using `curl` and shell scripts.

## Service Ports & Endpoints

| Service  | Port | Usage        |
| -------- | ---- | ------------ |
| Backend  | 5000 | API requests |
| Frontend | 3000 | Next.js UI   |

:::info
Always target port `5000` when testing the backend APIs unless your deployment specifies otherwise.
:::

## Authentication

Most endpoints require an API key:

```bash
curl -X POST http://localhost:5000/conversations \
  -H "Content-Type: application/json" \
  -H "x-api-key: da2-5z3fzvunwvhwtbyudvutf6x6by" \
  -d "{"title": "Chat QA Demo"}"
```

If you receive `{"error":"Unauthorized: Invalid API Key"}`, verify that the key is present, valid, and loaded by the backend.

## Core Endpoints

### Health Check

```bash
curl -X GET http://localhost:5000/health
```

Expected output: `{"status":"ok"}`. A HTML response indicates that the endpoint may be missing or you hit the wrong port.

### Create Conversation

```bash
curl -X POST http://localhost:5000/conversations \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-key>" \
  -d "{"title": "Chat QA Demo"}"
```

Expected output:

```json
{
  "id": "<conversationId>",
  "title": "Chat QA Demo"
}
```

### Send Message

```bash
curl -X POST http://localhost:5000/messages/<conversationId> \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-key>" \
  -d "{"from":"user","to":"assistant","type":"text","content":"Hello Agrinet!"}"
```

### Get Messages

```bash
curl -X GET http://localhost:5000/messages/<conversationId> \
  -H "x-api-key: <your-key>"
```

### Streaming (SSE)

```bash
curl -N http://localhost:5000/stream/<conversationId> \
  -H "Accept: text/event-stream" \
  -H "x-api-key: <your-key>"
```

## Common Errors

| Output                                           | Action                                 |
| ------------------------------------------------ | -------------------------------------- |
| `<html>Cannot GET/POST ...</html>`               | Wrong port or endpoint not implemented |
| `{"error":"Unauthorized: Invalid API Key"}`      | Missing or invalid key                 |
| `404: This page could not be found.`             | Accessed frontend instead of backend   |
| `zsh: no such file or directory: conversationId` | Did not replace placeholder            |
| `curl: (3) URL rejected: Port number ...`        | Malformed URL                          |

## Troubleshooting Checklist

- Confirm the backend is listening on port `5000`.
- Double-check that environment variables include the correct API keys.
- Use the correct HTTP verb and endpoint path.
- Replace placeholders such as `<conversationId>` with actual values.
- Pipe responses through `jq` for readability: `curl ... | jq`.

## Example Test Script

```bash
#!/usr/bin/env bash

API="http://localhost:5000"
KEY="da2-5z3fzvunwvhwtbyudvutf6x6by"

echo "Health check..."
curl -sS "$API/health" | jq

echo "Create conversation..."
CONV_ID=$(curl -sS -X POST "$API/conversations" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $KEY" \
  -d "{"title":"Test"}" | jq -r .id)

echo "Send message..."
curl -sS -X POST "$API/messages/$CONV_ID" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $KEY" \
  -d "{"from":"user","to":"assistant","type":"text","content":"Hello!"}" | jq

echo "Get messages..."
curl -sS "$API/messages/$CONV_ID" \
  -H "x-api-key: $KEY" | jq
```

## Backend vs Frontend

- `localhost:3000` serves the Next.js frontend and returns HTML.
- `localhost:5000` serves the backend API and returns JSON.

## Reporting Issues

When you encounter problems:

- Inspect backend logs.
- Validate that required environment variables are present.
- Share the `curl` command and full response in your issue report.

For deeper examples, review the Fruitful [backend](https://github.com/NTARI-OpenCoreLab/Agrinet/tree/main/backend) and [frontend](https://github.com/NTARI-OpenCoreLab/Agrinet/tree/main/frontend) repositories.
