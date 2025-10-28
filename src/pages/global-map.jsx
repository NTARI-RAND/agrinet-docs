import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
// Leaflet CSS is loaded from docusaurus.config.js stylesheets, so we do not import it here.

const POLL_INTERVAL_MS = 30_000;
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_STATIC_DATA = "/data/global_map_layer.geojson";

const buildEndpoint = (baseUrl, path) => {
  if (!baseUrl) {
    return path;
  }

  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}${path}`;
};

export default function GlobalMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const mapRef = useRef(null);

  const registryBaseUrl =
    typeof process !== "undefined" && process.env.AGRINET_REGISTRY_URL
      ? process.env.AGRINET_REGISTRY_URL
      : "";

  const nodesEndpoint = useMemo(
    () => buildEndpoint(registryBaseUrl, "/api/nodes"),
    [registryBaseUrl]
  );

  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    let isActive = true;
    const controller = new AbortController();

    const enhanceFeatures = (collection) => {
      const now = Date.now();
      const features = (collection.features || []).map((feature) => {
        const properties = feature.properties || {};
        const lastSeen = properties.last_seen
          ? Date.parse(properties.last_seen)
          : undefined;
        const isOnline =
          typeof lastSeen === "number" &&
          !Number.isNaN(lastSeen) &&
          now - lastSeen <= ONLINE_THRESHOLD_MS;

        return {
          ...feature,
          properties: {
            ...properties,
            _isOnline: Boolean(isOnline),
          },
        };
      });

      return { ...collection, features };
    };

    const load = async (attemptFallback = false) => {
      const target = attemptFallback ? FALLBACK_STATIC_DATA : nodesEndpoint;

      try {
        const response = await fetch(target, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        if (isActive) {
          setGeoJsonData(enhanceFeatures(json));
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (!attemptFallback) {
          console.error("Failed to load nodes from registry:", error);
          load(true);
        } else {
          console.error("Failed to load fallback GeoJSON:", error);
        }
      }
    };

    load();
    const intervalId = window.setInterval(() => load(), POLL_INTERVAL_MS);

    return () => {
      isActive = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [isBrowser, nodesEndpoint]);

  useEffect(() => {
    if (geoJsonData && mapRef.current) {
      try {
        const bounds = L.geoJSON(geoJsonData).getBounds();
        if (
          bounds && typeof bounds.isValid === "function"
            ? bounds.isValid()
            : true
        ) {
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (error) {
        console.warn("Could not fit bounds:", error);
      }
    }
  }, [geoJsonData]);

  if (!isBrowser) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Agrinet Global Map</h1>
        <p>Loading map…</p>
      </div>
    );
  }

  const displayEndpoint = nodesEndpoint || "/api/nodes";

  return (
    <div style={{ padding: 16 }}>
      <h1>Agrinet Global Map</h1>
      <p>
        The map polls <code>{displayEndpoint}</code> every 30 seconds to keep
        node locations and status up to date. Set the
        <code>AGRINET_REGISTRY_URL</code> environment variable when building the
        docs if your registry is hosted on another domain. If the registry
        cannot be reached, the map falls back to the last published static
        dataset.
      </p>

      <div style={{ height: 600, borderRadius: 6, overflow: "hidden" }}>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              pointToLayer={(feature, latlng) => {
                const isOnline = feature?.properties?._isOnline;
                const color = isOnline ? "#2b87ff" : "#7a7a7a";

                return L.circleMarker(latlng, {
                  radius: 8,
                  color,
                  fillColor: color,
                  weight: 2,
                  fillOpacity: isOnline ? 0.8 : 0.35,
                });
              }}
              onEachFeature={(feature, layer) => {
                const p = feature.properties || {};
                const languages =
                  Array.isArray(p.languages) && p.languages.length
                    ? p.languages.join(", ")
                    : "—";
                const categories =
                  Array.isArray(p.ping_categories) && p.ping_categories.length
                    ? p.ping_categories.join(", ")
                    : "—";
                const lastSeenDate = p.last_seen ? new Date(p.last_seen) : null;
                const lastSeenDisplay =
                  lastSeenDate && !Number.isNaN(lastSeenDate)
                    ? lastSeenDate.toLocaleString()
                    : "—";
                const status = p._isOnline ? "Online" : "Offline";

                const forkLink = p.fork_repo
                  ? `<a href="${p.fork_repo}" target="_blank" rel="noreferrer">Fork repo</a>`
                  : "";

                const html = `
                  <div>
                    <strong>${p.node_name || "Unknown node"}</strong><br/>
                    <strong>Status:</strong> ${status}<br/>
                    <strong>Last seen:</strong> ${lastSeenDisplay}<br/>
                    <strong>Type:</strong> ${p.node_type || "—"}<br/>
                    <strong>Email:</strong> ${p.contact_email || "—"}<br/>
                    <strong>Languages:</strong> ${languages}<br/>
                    <strong>Categories:</strong> ${categories}<br/>
                    ${forkLink}
                  </div>
                `;

                layer.bindPopup(html);
              }}
            />
          )}
        </MapContainer>
      </div>

      <p style={{ marginTop: 12 }}>
        <a href="/data/global_map_layer.geojson" download>
          Download the latest published GeoJSON snapshot
        </a>
      </p>
    </div>
  );
}
