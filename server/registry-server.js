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

let nodes = new Map();
const sseClients = new Set();

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
};

const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];

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

function broadcastUpdate() {
  const payload = `data: ${JSON.stringify(collectionFromNodes())}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

async function persistNodes() {
  const collection = collectionFromNodes();
  await fsPromises.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fsPromises.writeFile(DATA_FILE, JSON.stringify(collection, null, 2));
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

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const headers = { ...jsonHeaders, ...extraHeaders };
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(text);
}

function handleOptions(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": allowedMethods.join(", "),
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "600",
  });
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

  if (method === "OPTIONS") {
    handleOptions(res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (method === "GET" && url.pathname === "/api/nodes") {
    sendJson(res, 200, collectionWithDerivedState());
    return;
  }

  if (method === "GET" && url.pathname === "/api/nodes/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(`data: ${JSON.stringify(collectionWithDerivedState())}\n\n`);
    sseClients.add(res);
    req.on("close", () => {
      sseClients.delete(res);
    });
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
        sendJson(res, 404, { error: "Node not found" });
        return;
      }
      sendJson(res, 200, augmentWithOnlineStatus(feature));
      return;
    }

    if (parts.length === 1 && method === "DELETE") {
      const id = decodeURIComponent(parts[0]);
      if (!nodes.has(id)) {
        sendJson(res, 404, { error: "Node not found" });
        return;
      }
      removeNode(id);
      await persistNodes();
      sendJson(res, 204, {});
      broadcastUpdate();
      return;
    }

    if (parts.length === 2 && parts[1] === "ping" && method === "PUT") {
      const id = decodeURIComponent(parts[0]);
      const existing = nodes.get(id);
      if (!existing) {
        sendJson(res, 404, { error: "Node not found" });
        return;
      }

      let body = {};
      try {
        body = (await getRequestBody(req)) || {};
      } catch (error) {
        sendJson(res, 400, { error: error.message });
        return;
      }

      const lastSeen = body.last_seen ? new Date(body.last_seen) : new Date();
      if (Number.isNaN(lastSeen.getTime())) {
        sendJson(res, 400, { error: "Invalid last_seen timestamp" });
        return;
      }

      const updated = {
        ...existing,
        properties: {
          ...existing.properties,
          ...body.properties,
          last_seen: lastSeen.toISOString(),
        },
      };

      if (body.geometry) {
        try {
          updated.geometry = normalizeGeometry(body.geometry);
        } catch (error) {
          sendJson(res, 400, { error: error.message });
          return;
        }
      }

      upsertNode(updated);
      await persistNodes();
      sendJson(res, 200, augmentWithOnlineStatus(updated));
      broadcastUpdate();
      return;
    }
  }

  if (method === "POST" && url.pathname === "/api/nodes") {
    let body;
    try {
      body = await getRequestBody(req);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!body) {
      sendJson(res, 400, { error: "Missing request body" });
      return;
    }

    try {
      const feature = parseIncomingFeature(body, nodes.size);
      const id = feature.properties.id;
      if (nodes.has(id)) {
        sendJson(res, 409, { error: "Node with that id already exists" });
        return;
      }

      upsertNode(feature);
      await persistNodes();
      const responsePayload = augmentWithOnlineStatus(feature);
      sendJson(res, 201, responsePayload, {
        Location: `/api/nodes/${encodeURIComponent(feature.properties.id)}`,
      });
      broadcastUpdate();
      return;
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }
  }

  sendJson(res, 404, { error: "Not found" });
}

async function start() {
  await loadInitialNodes();

  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error("Unhandled error:", error);
      try {
        sendJson(res, 500, { error: "Internal server error" });
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
