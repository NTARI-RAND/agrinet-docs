---
title: SMS Access & Queueing
sidebar_position: 4
---

Provide SMS access for users without smartphones by wiring Twilio webhooks, offline queues, and localized replies. The SMS gateway mirrors marketplace and weather capabilities exposed in the Agrinet Engine.

## Prerequisites

- Twilio programmable SMS number with webhook support.
- Exposed HTTPS endpoint reachable by Twilio (use ngrok for local testing).
- Configured environment variables:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_SMS_NUMBER=+15551234567
SMS_LOCALE_DEFAULT=en
SMS_OFFLINE_QUEUE=true
```

## Inbound Webhooks

Twilio invokes the SMS routes with payloads containing sender, body, and metadata.

`POST /sms/inbound`

```json
{
  "From": "+255700123456",
  "To": "+15551234567",
  "Body": "price maize",
  "MessageSid": "SM1234567890"
}
```

Handler actions:

1. Parse the intent (e.g., market price lookup, weather query, contract status).
2. Enqueue processing work in `bull/smsQueue.js` for asynchronous responses.
3. Log interactions for audit and LBTAS context.

Return a TwiML response confirming receipt or immediate reply content.

## Outbound Queueing

Send SMS updates or alerts through the queue worker.

`POST /sms/queue`

```json
{
  "to": "+255700123456",
  "body": "Maize (Grade A) is 480 KES/kg in Kisumu market.",
  "locale": "sw"
}
```

Workers translate content when localized templates exist and store delivery attempts in DynamoDB. Delivery confirmations from Twilio hit `POST /sms/status` with `MessageStatus` payloads.

## Local Language Support

- Provide translation files per locale (e.g., `sms/translations/sw.json`).
- Use fallback to `SMS_LOCALE_DEFAULT` when no translation is available.
- Include transliteration for languages requiring Latin script approximations.

## Offline & Retry Strategy

- Enable `SMS_OFFLINE_QUEUE` to cache outbound messages when connectivity is lost.
- Workers retry with exponential backoff, tagging messages with `deliveryAttempts`.
- Confirm final delivery before marking associated notifications as complete.

## Integrations

- Trigger SMS alerts for contract pings (`/contracts/:id/pings`) and rating reminders.
- Provide weather data by querying connected services via background jobs.
- Mirror chat messages by piping critical notifications from `/events` SSE into SMS for offline participants.

Monitor Twilio logs and BullMQ dashboards to maintain throughput and troubleshoot delivery failures.
