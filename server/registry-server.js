#!/usr/bin/env node

"use strict";

const http = require("http");
const { URL } = require("url");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");

const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_FILE = path.join(__dirname, "nodes.json");
const STATIC_SEED_FILE = path.join(
  __dirname,
  "..",
  "static",
  "data",
  "global_map_layer.geojson"
);
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const WRITE_TOKEN = process.env.REGISTRY_WRITE_TOKEN || "";
const READ_ORIGINS = (process.env.REGISTRY_READ_ORIGINS || "*")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const WRITE_ORIGINS = (process.env.REGISTRY_WRITE_ORIGINS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const hasWriteTokenConfigured = WRITE_TOKEN.length > 0;

let nodes = new Map();
const sseClients = new Set();
const sseKeepAliveTimers = new Map();

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const KEEPALIVE_INTERVAL_MS = 30_000;

let writeLock = Promise.resolve();

function isOriginAllowed(origin, allowList) {
  if (!origin) {
    return true;
  }

  if (!allowList || allowList.length === 0) {
    return false;
  }

  if (allowList.includes("*")) {
    return true;
  }

  return allowList.includes(origin);
}

function resolveAllowedOrigin(origin, allowList) {
  return isOriginAllowed(origin, allowList) ? origin || allowList[0] : null;
}

function withWriteLock(action) {
  const run = async () => {
    return action();
  };

  const next = writeLock.then(run, run);
  writeLock = next.catch(() => {});
  return next;
}

function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }

  const trimmed = headerValue.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }

  return trimmed;
}

function resolveWriteToken(req) {
  const authHeader = extractBearerToken(req.headers.authorization);
  const apiKeyHeader = typeof req.headers["x-api-key"] === "string"
    ? req.headers["x-api-key"].trim()
    : null;
  return authHeader || apiKeyHeader || null;
}

function ensureWriteAuthorized(req, res) {
  if (!hasWriteTokenConfigured) {
    sendJson(
      req,
      res,
      503,
      {
        error:
          "Write operations are disabled because REGISTRY_WRITE_TOKEN is not configured on the server.",
      },
      {},
      WRITE_ORIGINS
    );
    return false;
  }

  const incomingToken = resolveWriteToken(req);
  if (incomingToken && incomingToken === WRITE_TOKEN) {
    return true;
  }

  sendJson(
    req,
    res,
    401,
    { error: "Unauthorized" },
    { "WWW-Authenticate": "Bearer" },
    WRITE_ORIGINS
  );
  return false;
}

function slugify(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || null;
}

function ensureFeatureHasId(feature, index = 0) {
  const properties = { ...(feature.properties || {}) };
  let id = properties.id;

  if (!id) {
    const slug = slugify(properties.node_name);
    if (slug) {
      id = slug;
    }
  }

  if (!id) {
    id = `node-${index + 1}`;
  }

  let finalId = id;
  let collision = 1;
  while (nodes.has(finalId)) {
    collision += 1;
    finalId = `${id}-${collision}`;
  }

  properties.id = finalId;

  return {
    ...feature,
    properties,
  };
}

function normalizeGeometry(geometry) {
  if (!geometry || typeof geometry !== "object") {
    throw new Error("Missing geometry");
  }

  if (geometry.type !== "Point") {
    throw new Error("Only Point geometries are supported");
  }

  const coordinates = geometry.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("Point coordinates must be an array of [longitude, latitude]");
  }

  const lon = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  if (Number.isNaN(lon) || Number.isNaN(lat)) {
    throw new Error("Coordinates must be numeric");
  }

  return {
    type: "Point",
    coordinates: [lon, lat],
  };
}

function parseIncomingFeature(body, index = 0) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid body");
  }

  let feature;
  if (body.type === "Feature") {
    feature = {
      type: "Feature",
      properties: { ...(body.properties || {}) },
      geometry: normalizeGeometry(body.geometry),
    };
  } else {
    const { geometry, ...properties } = body;
    feature = {
      type: "Feature",
      properties: { ...properties },
      geometry: normalizeGeometry(geometry),
    };
  }

  const lastSeen = feature.properties.last_seen
    ? new Date(feature.properties.last_seen)
    : new Date();

  if (Number.isNaN(lastSeen.getTime())) {
    throw new Error("Invalid last_seen timestamp");
  }

  feature.properties.last_seen = lastSeen.toISOString();

  const normalized = ensureFeatureHasId(feature, index);
  return normalized;
}

function upsertNode(feature) {
  const id = feature.properties.id;
  nodes.set(id, feature);
}

function removeNode(id) {
  return nodes.delete(id);
}

function collectionFromNodes() {
  return {
    type: "FeatureCollection",
    features: Array.from(nodes.values()),
  };
}

function cleanupSseClient(client) {
  if (sseClients.has(client)) {
    sseClients.delete(client);
  }
  const timer = sseKeepAliveTimers.get(client);
  if (timer) {
    clearInterval(timer);
    sseKeepAliveTimers.delete(client);
  }
  try {
    client.end();
  } catch (error) {
    // noop
  }
}

function registerSseClient(res) {
  sseClients.add(res);
  if (!sseKeepAliveTimers.has(res)) {
    const timer = setInterval(() => {
      try {
        res.write(": keep-alive\n\n");
      } catch (error) {
        cleanupSseClient(res);
      }
    }, KEEPALIVE_INTERVAL_MS);
    sseKeepAliveTimers.set(res, timer);
  }
  res.on("close", () => {
    cleanupSseClient(res);
  });
  res.on("error", () => {
    cleanupSseClient(res);
  });
}

function broadcastUpdate() {
  const payload = `data: ${JSON.stringify(collectionWithDerivedState())}\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.write(payload);
    } catch (error) {
      cleanupSseClient(client);
    }
  }
}

async function persistNodes() {
  const collection = collectionFromNodes();
  const dir = path.dirname(DATA_FILE);
  await fsPromises.mkdir(dir, { recursive: true });
  const payload = JSON.stringify(collection, null, 2);
  const tempFile = path.join(
    dir,
    `.nodes.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  await fsPromises.writeFile(tempFile, payload, { encoding: "utf8" });
  await fsPromises.rename(tempFile, DATA_FILE);
}

async function loadInitialNodes() {
  const candidates = [DATA_FILE, STATIC_SEED_FILE];
  for (const file of candidates) {
    try {
      await fsPromises.access(file, fs.constants.R_OK);
      const raw = await fsPromises.readFile(file, "utf8");
      const json = JSON.parse(raw);
      if (json && json.type === "FeatureCollection" && Array.isArray(json.features)) {
        nodes = new Map();
        json.features.forEach((feature, index) => {
          try {
            const normalized = parseIncomingFeature(feature, index);
            upsertNode(normalized);
          } catch (error) {
            console.warn(`Skipping feature while loading ${file}:`, error.message);
          }
        });
        return;
      }
    } catch (error) {
      // Try next candidate
    }
  }

  nodes = new Map();
}

function sendJson(
  req,
  res,
  statusCode,
  payload,
  extraHeaders = {},
  allowedOrigins = READ_ORIGINS
) {
  const originHeader = resolveAllowedOrigin(req.headers.origin, allowedOrigins);
  const headers = { ...jsonHeaders, ...extraHeaders };
  if (originHeader) {
    headers["Access-Control-Allow-Origin"] = originHeader;
    if (originHeader !== "*") {
      headers["Vary"] = headers["Vary"]
        ? `${headers["Vary"]}, Origin`
        : "Origin";
    }
  }
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
}

function sendText(req, res, statusCode, text, allowedOrigins = READ_ORIGINS) {
  const originHeader = resolveAllowedOrigin(req.headers.origin, allowedOrigins);
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
  };
  if (originHeader) {
    headers["Access-Control-Allow-Origin"] = originHeader;
    if (originHeader !== "*") {
      headers["Vary"] = "Origin";
    }
  }
  res.writeHead(statusCode, headers);
  res.end(text);
}

function handleOptions(req, res, allowedOrigins) {
  const originHeader = resolveAllowedOrigin(req.headers.origin, allowedOrigins);
  const headers = {
    "Access-Control-Allow-Methods": allowedMethods.join(", "),
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Max-Age": "600",
  };

  if (originHeader) {
    headers["Access-Control-Allow-Origin"] = originHeader;
    if (originHeader !== "*") {
      headers["Vary"] = "Origin";
    }
  }

  res.writeHead(204, headers);
  res.end();
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

function augmentWithOnlineStatus(feature) {
  const now = Date.now();
  const lastSeen = feature.properties.last_seen
    ? Date.parse(feature.properties.last_seen)
    : undefined;

  const isOnline =
    typeof lastSeen === "number" &&
    !Number.isNaN(lastSeen) &&
    now - lastSeen <= ONLINE_THRESHOLD_MS;

  return {
    ...feature,
    properties: {
      ...feature.properties,
      _isOnline: Boolean(isOnline),
    },
  };
}

function collectionWithDerivedState() {
  const base = collectionFromNodes();
  return {
    ...base,
    features: base.features.map(augmentWithOnlineStatus),
  };
}

async function handleRequest(req, res) {
  const method = req.method || "GET";

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (method === "OPTIONS") {
    const requestedMethod = req.headers["access-control-request-method"];
    const allowList =
      url.pathname.startsWith("/api/nodes") &&
      requestedMethod &&
      ["POST", "PUT", "DELETE"].includes(requestedMethod.toUpperCase())
        ? WRITE_ORIGINS
        : READ_ORIGINS;
    handleOptions(req, res, allowList);
    return;
  }

  if (method === "GET" && url.pathname === "/api/nodes") {
    sendJson(req, res, 200, collectionWithDerivedState(), {}, READ_ORIGINS);
    return;
  }

  if (method === "GET" && url.pathname === "/api/nodes/stream") {
    const originHeader = resolveAllowedOrigin(req.headers.origin, READ_ORIGINS);
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    };
    if (originHeader) {
      headers["Access-Control-Allow-Origin"] = originHeader;
      if (originHeader !== "*") {
        headers["Vary"] = "Origin";
      }
    }
    res.writeHead(200, headers);
    res.write(`data: ${JSON.stringify(collectionWithDerivedState())}\n\n`);
    registerSseClient(res);
    return;
  }

  const nodeIdMatch = url.pathname.match(/^\/api\/nodes\/(.+)$/);
  if (nodeIdMatch) {
    const [_, nodePath] = nodeIdMatch;
    const parts = nodePath.split("/").filter(Boolean);

    if (parts.length === 1 && method === "GET") {
      const id = decodeURIComponent(parts[0]);
      const feature = nodes.get(id);
      if (!feature) {
        sendJson(req, res, 404, { error: "Node not found" });
        return;
      }
      sendJson(req, res, 200, augmentWithOnlineStatus(feature));
      return;
    }

    if (parts.length === 1 && method === "DELETE") {
      if (!ensureWriteAuthorized(req, res)) {
        return;
      }
      const id = decodeURIComponent(parts[0]);
      const deleted = await withWriteLock(async () => {
        if (!nodes.has(id)) {
          return false;
        }
        removeNode(id);
        await persistNodes();
        return true;
      });
      if (!deleted) {
        sendJson(req, res, 404, { error: "Node not found" }, {}, WRITE_ORIGINS);
        return;
      }
      sendJson(req, res, 204, {}, {}, WRITE_ORIGINS);
      broadcastUpdate();
      return;
    }

    if (parts.length === 2 && parts[1] === "ping" && method === "PUT") {
      if (!ensureWriteAuthorized(req, res)) {
        return;
      }
      const id = decodeURIComponent(parts[0]);
      let body = {};
      try {
        body = (await getRequestBody(req)) || {};
      } catch (error) {
        sendJson(req, res, 400, { error: error.message }, {}, WRITE_ORIGINS);
        return;
      }

      const lastSeen = body.last_seen ? new Date(body.last_seen) : new Date();
      if (Number.isNaN(lastSeen.getTime())) {
        sendJson(req, res, 400, { error: "Invalid last_seen timestamp" }, {}, WRITE_ORIGINS);
        return;
      }

      let normalizedGeometry;
      if (body.geometry) {
        try {
          normalizedGeometry = normalizeGeometry(body.geometry);
        } catch (error) {
          sendJson(req, res, 400, { error: error.message }, {}, WRITE_ORIGINS);
          return;
        }
      }

      let updateResult;
      try {
        updateResult = await withWriteLock(async () => {
          const existing = nodes.get(id);
          if (!existing) {
            return { found: false };
          }

          const updated = {
            ...existing,
            properties: {
              ...existing.properties,
              ...body.properties,
              last_seen: lastSeen.toISOString(),
            },
          };

          if (normalizedGeometry) {
            updated.geometry = normalizedGeometry;
          }

          upsertNode(updated);
          await persistNodes();
          return { found: true, feature: updated };
        });
      } catch (error) {
        console.error("Failed to persist heartbeat", error);
        sendJson(req, res, 500, { error: "Internal server error" }, {}, WRITE_ORIGINS);
        return;
      }

      if (!updateResult.found) {
        sendJson(req, res, 404, { error: "Node not found" }, {}, WRITE_ORIGINS);
        return;
      }

      sendJson(
        req,
        res,
        200,
        augmentWithOnlineStatus(updateResult.feature),
        {},
        WRITE_ORIGINS
      );
      broadcastUpdate();
      return;
    }
  }

  if (method === "POST" && url.pathname === "/api/nodes") {
    if (!ensureWriteAuthorized(req, res)) {
      return;
    }
    let body;
    try {
      body = await getRequestBody(req);
    } catch (error) {
      sendJson(req, res, 400, { error: error.message }, {}, WRITE_ORIGINS);
      return;
    }

    if (!body) {
      sendJson(req, res, 400, { error: "Missing request body" }, {}, WRITE_ORIGINS);
      return;
    }

    try {
      const result = await withWriteLock(async () => {
        let feature;
        try {
          feature = parseIncomingFeature(body, nodes.size);
        } catch (error) {
          error.statusCode = 400;
          throw error;
        }
        const id = feature.properties.id;
        if (nodes.has(id)) {
          return { error: "conflict" };
        }

        upsertNode(feature);
        await persistNodes();
        return { feature };
      });

      if (result.error === "conflict") {
        sendJson(
          req,
          res,
          409,
          { error: "Node with that id already exists" },
          {},
          WRITE_ORIGINS
        );
        return;
      }

      const responsePayload = augmentWithOnlineStatus(result.feature);
      sendJson(
        req,
        res,
        201,
        responsePayload,
        {
          Location: `/api/nodes/${encodeURIComponent(
            result.feature.properties.id
          )}`,
        },
        WRITE_ORIGINS
      );
      broadcastUpdate();
      return;
    } catch (error) {
      const status = error && error.statusCode ? error.statusCode : 500;
      if (status === 500) {
        console.error("Failed to register node", error);
      }
      sendJson(
        req,
        res,
        status,
        { error: error && error.message ? error.message : "Internal server error" },
        {},
        WRITE_ORIGINS
      );
      return;
    }
  }

  sendJson(req, res, 404, { error: "Not found" });
}

async function start() {
  await loadInitialNodes();

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error("Unhandled error:", error);
      try {
        sendJson(req, res, 500, { error: "Internal server error" });
      } catch (sendError) {
        res.destroy(sendError);
      }
    });
  });

  server.listen(PORT, HOST, () => {
    console.log(`Agrinet registry server listening on http://${HOST}:${PORT}`);
  });

  server.on("clientError", (err, socket) => {
    console.warn("Client error", err.message);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });
}

start().catch((error) => {
  console.error("Failed to start registry server:", error);
  process.exitCode = 1;
});
