import React, { useEffect, useMemo, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
// Leaflet CSS is loaded from docusaurus.config.js stylesheets, so we do not import it here.

const POLL_INTERVAL_MS = 30_000;
const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_STATIC_DATA = "/data/global_map_layer.geojson";

const isSafeHttpUrl = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch (error) {
    return null;
  }

  return null;
};

const createInfoRow = (label, value) => {
  const row = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = `${label}:`;
  row.appendChild(strong);
  row.appendChild(document.createTextNode(` ${value}`));
  return row;
};

const buildPopupContent = (properties) => {
  const container = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = properties.node_name || "Unknown node";
  container.appendChild(title);

  container.appendChild(document.createElement("br"));

  container.appendChild(
    createInfoRow("Status", properties._isOnline ? "Online" : "Offline")
  );
  container.appendChild(
    createInfoRow("Last seen", properties.last_seen || "—")
  );
  container.appendChild(createInfoRow("Type", properties.node_type || "—"));
  container.appendChild(
    createInfoRow("Email", properties.contact_email || "—")
  );

  const languages = Array.isArray(properties.languages)
    ? properties.languages.join(", ") || "—"
    : "—";
  container.appendChild(createInfoRow("Languages", languages));

  const categories = Array.isArray(properties.ping_categories)
    ? properties.ping_categories.join(", ") || "—"
    : "—";
  container.appendChild(createInfoRow("Categories", categories));

  const safeForkUrl = isSafeHttpUrl(properties.fork_repo);
  if (safeForkUrl) {
    const linkRow = document.createElement("div");
    const anchor = document.createElement("a");
    anchor.href = safeForkUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = "Fork repo";
    linkRow.appendChild(anchor);
    container.appendChild(linkRow);
  }

  return container;
};

const buildEndpoint = (baseUrl, path) => {
  if (!baseUrl) {
    return path;
  }

  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}${path}`;
};

function GlobalMapContent() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  const registryBaseUrl =
    typeof process !== "undefined" && process.env.AGRINET_REGISTRY_URL
      ? process.env.AGRINET_REGISTRY_URL
      : "";

  const nodesEndpoint = useMemo(
    () => buildEndpoint(registryBaseUrl, "/api/nodes"),
    [registryBaseUrl]
  );

  useEffect(() => {
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
          const enhanced = enhanceFeatures(json);
          setGeoJsonData(enhanced);
          if (attemptFallback) {
            setIsUsingFallback(true);
            setErrorMessage(
              "Live registry is unavailable. Displaying the last published snapshot."
            );
          } else {
            setIsUsingFallback(false);
            setErrorMessage(null);
          }
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
          if (isActive) {
            setIsUsingFallback(false);
            setErrorMessage(
              "Unable to load registry or fallback data. Please try again later."
            );
          }
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
  }, [nodesEndpoint]);

  useEffect(() => {
    if (geoJsonData && mapRef.current && leafletRef.current) {
      try {
        const bounds = leafletRef.current.geoJSON(geoJsonData).getBounds();
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

      {errorMessage && (
        <div
          role="status"
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            color: "#856404",
            borderRadius: 6,
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      )}

      <div style={{ height: 600, borderRadius: 6, overflow: "hidden" }}>
        <BrowserOnly
          fallback={
            <div style={{ padding: 16 }}>
              <p>Loading map…</p>
            </div>
          }
        >
          {() => {
            const { MapContainer, TileLayer, GeoJSON } = require("react-leaflet");
            // eslint-disable-next-line global-require
            const L = require("leaflet");

            if (!leafletRef.current) {
              leafletRef.current = L;
            }

            return (
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
                      const popupContent = buildPopupContent({
                        ...p,
                        last_seen:
                          p.last_seen && !Number.isNaN(new Date(p.last_seen))
                            ? new Date(p.last_seen).toLocaleString()
                            : "—",
                      });

                      layer.bindPopup(popupContent);
                    }}
                  />
                )}
              </MapContainer>
            );
          }}
        </BrowserOnly>
      </div>

      <p style={{ marginTop: 12 }}>
        <a href="/data/global_map_layer.geojson" download>
          Download the latest published GeoJSON snapshot
        </a>
        {isUsingFallback && !errorMessage && (
          <span style={{ marginLeft: 8 }}>
            (Currently displaying the fallback dataset.)
          </span>
        )}
      </p>
    </div>
  );
}

export default function GlobalMap() {
  return <GlobalMapContent />;
}
