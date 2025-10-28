const test = require("node:test");
const assert = require("node:assert/strict");
const { mkdtemp, rm, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("path");
const { spawn } = require("child_process");
const { once } = require("events");

let portCounter = 4700;

function allocatePort() {
  portCounter += 1;
  return portCounter;
}

async function waitForReady(child) {
  return new Promise((resolve, reject) => {
    let stderrBuffer = "";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for registry server to start"));
    }, 5000);

    const onStdout = (chunk) => {
      const text = chunk.toString();
      if (text.includes("Agrinet registry server listening")) {
        cleanup();
        resolve();
      }
    };

    const onStderr = (chunk) => {
      stderrBuffer += chunk.toString();
    };

    const onExit = (code) => {
      cleanup();
      reject(
        new Error(
          `Registry server exited early with code ${code ?? "null"}: ${stderrBuffer}`
        )
      );
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearTimeout(timeout);
      child.stdout.off("data", onStdout);
      child.stderr.off("data", onStderr);
      child.off("exit", onExit);
      child.off("error", onError);
    };

    child.stdout.on("data", onStdout);
    child.stderr.on("data", onStderr);
    child.on("exit", onExit);
    child.on("error", onError);
  });
}

async function startRegistryProcess({ port, env = {} }) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "agrinet-registry-test-"));
  const dataFile = path.join(tempDir, "nodes.json");
  const seedPath = path.join(tempDir, "seed.json");
  await writeFile(
    seedPath,
    JSON.stringify({ type: "FeatureCollection", features: [] }),
    "utf8"
  );

  const child = spawn(process.execPath, [path.join(__dirname, "..", "registry-server.js")], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      REGISTRY_DATA_FILE: dataFile,
      REGISTRY_STATIC_SEED_FILE: seedPath,
      REGISTRY_WRITE_TOKEN: "test-write-token",
      REGISTRY_READ_ORIGINS: "*",
      REGISTRY_WRITE_ORIGINS: "*",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  await waitForReady(child);

  const baseUrl = `http://127.0.0.1:${port}`;

  return {
    baseUrl,
    async cleanup() {
      if (child.exitCode === null) {
        child.kill();
        try {
          await once(child, "exit");
        } catch (error) {
          // ignore errors when shutting down the child process
        }
      }
      await rm(tempDir, { recursive: true, force: true });
    },
  };
}

async function postJson(url, body, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}

async function putJson(url, body, token) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return response;
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  const json = await response.json();
  return { response, json };
}

const WRITE_TOKEN = "test-write-token";

test("registry server safeguards", async (t) => {
  await t.test("rejects invalid contact_email during registration", async () => {
    const context = await startRegistryProcess({ port: allocatePort() });
    try {
      const invalidResponse = await postJson(
        `${context.baseUrl}/api/nodes`,
        {
          type: "Feature",
          properties: {
            node_name: "Invalid Email Node",
            contact_email: "not-an-email",
            node_type: "Plan",
          },
          geometry: {
            type: "Point",
            coordinates: [36.82, -1.29],
          },
        },
        WRITE_TOKEN
      );

      assert.strictEqual(invalidResponse.status, 400);
      const invalidBody = await invalidResponse.json();
      assert.match(invalidBody.error, /contact_email/);

      const validResponse = await postJson(
        `${context.baseUrl}/api/nodes`,
        {
          type: "Feature",
          properties: {
            node_name: "Valid Node",
            contact_email: "ops@example.org",
            node_type: "Service",
            languages: ["English", "Swahili"],
          },
          geometry: {
            type: "Point",
            coordinates: [36.82, -1.29],
          },
        },
        WRITE_TOKEN
      );

      assert.strictEqual(validResponse.status, 201);
      const validBody = await validResponse.json();
      assert.equal(validBody.properties.contact_email, "ops@example.org");
      assert.ok(Array.isArray(validBody.properties.languages));
    } finally {
      await context.cleanup();
    }
  });

  await t.test("enforces write rate limiting", async () => {
    const context = await startRegistryProcess({
      port: allocatePort(),
      env: {
        REGISTRY_RATE_LIMIT_MAX_WRITES: "3",
        REGISTRY_RATE_LIMIT_WINDOW_MS: "60000",
      },
    });

    try {
      const createResponse = await postJson(
        `${context.baseUrl}/api/nodes`,
        {
          type: "Feature",
          properties: {
            node_name: "Rate Limited Node",
            contact_email: "ops@example.org",
            node_type: "Service",
          },
          geometry: {
            type: "Point",
            coordinates: [10, 10],
          },
        },
        WRITE_TOKEN
      );
      assert.strictEqual(createResponse.status, 201);

      const pingUrl = `${context.baseUrl}/api/nodes/rate-limited-node/ping`;
      const firstPing = await putJson(
        pingUrl,
        { last_seen: new Date().toISOString() },
        WRITE_TOKEN
      );
      assert.strictEqual(firstPing.status, 200);

      const secondPing = await putJson(
        pingUrl,
        { last_seen: new Date().toISOString() },
        WRITE_TOKEN
      );
      assert.strictEqual(secondPing.status, 200);

      const thirdPing = await putJson(
        pingUrl,
        { last_seen: new Date().toISOString() },
        WRITE_TOKEN
      );
      assert.strictEqual(thirdPing.status, 429);
      assert.ok(thirdPing.headers.get("retry-after"));
      const errorBody = await thirdPing.json();
      assert.match(errorBody.error, /Too many write requests/);
    } finally {
      await context.cleanup();
    }
  });

  await t.test("rejects invalid geometry during registration", async () => {
    const context = await startRegistryProcess({ port: allocatePort() });

    try {
      const response = await postJson(
        `${context.baseUrl}/api/nodes`,
        {
          type: "Feature",
          properties: {
            node_name: "Bad geometry",
            contact_email: "ops@example.org",
            node_type: "Service",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
        WRITE_TOKEN
      );

      assert.strictEqual(response.status, 400);
      const payload = await response.json();
      assert.match(payload.error, /Only Point geometries are supported/i);
    } finally {
      await context.cleanup();
    }
  });

  await t.test("serves registered nodes and updates heartbeat", async () => {
    const context = await startRegistryProcess({ port: allocatePort() });

    try {
      const createResponse = await postJson(
        `${context.baseUrl}/api/nodes`,
        {
          type: "Feature",
          properties: {
            node_name: "Heartbeat Node",
            contact_email: "ops@example.org",
            node_type: "Service",
            languages: ["English"],
          },
          geometry: {
            type: "Point",
            coordinates: [10, 10],
          },
        },
        WRITE_TOKEN
      );
      assert.strictEqual(createResponse.status, 201);
      const createdBody = await createResponse.json();
      const nodeId = createdBody.properties.id;

      const { response: getResponse, json: getJsonBody } = await getJson(
        `${context.baseUrl}/api/nodes/${nodeId}`
      );
      assert.strictEqual(getResponse.status, 200);
      assert.strictEqual(getJsonBody.properties.node_name, "Heartbeat Node");

      const heartbeatResponse = await putJson(
        `${context.baseUrl}/api/nodes/${nodeId}/ping`,
        { last_seen: "2025-01-01T00:00:00Z" },
        WRITE_TOKEN
      );
      assert.strictEqual(heartbeatResponse.status, 200);
      const heartbeatBody = await heartbeatResponse.json();
      assert.strictEqual(
        heartbeatBody.properties.last_seen,
        "2025-01-01T00:00:00.000Z"
      );

      const { json: afterPing } = await getJson(
        `${context.baseUrl}/api/nodes/${nodeId}`
      );
      assert.strictEqual(
        afterPing.properties.last_seen,
        "2025-01-01T00:00:00.000Z"
      );
    } finally {
      await context.cleanup();
    }
  });

  await t.test("rejects forbidden property updates during heartbeat", async () => {
    const context = await startRegistryProcess({ port: allocatePort() });

    try {
      const createResponse = await postJson(
        `${context.baseUrl}/api/nodes`,
        {
          type: "Feature",
          properties: {
            node_name: "Immutable Node",
            contact_email: "ops@example.org",
            node_type: "Service",
          },
          geometry: {
            type: "Point",
            coordinates: [10, 10],
          },
        },
        WRITE_TOKEN
      );
      assert.strictEqual(createResponse.status, 201);

      const forbiddenResponse = await putJson(
        `${context.baseUrl}/api/nodes/immutable-node/ping`,
        {
          last_seen: new Date().toISOString(),
          properties: {
            id: "new-id",
          },
        },
        WRITE_TOKEN
      );

      assert.strictEqual(forbiddenResponse.status, 400);
      const body = await forbiddenResponse.json();
      assert.match(body.error, /may not be modified/i);
    } finally {
      await context.cleanup();
    }
  });
});
