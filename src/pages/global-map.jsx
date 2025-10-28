import React, { useEffect, useRef, useState } from "react";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
// Leaflet CSS is loaded from docusaurus.config.js stylesheets, so we do not import it here.

export default function GlobalMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [leaflet, setLeaflet] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    import("leaflet")
      .then((module) => {
        if (isMounted) {
          setLeaflet(module.default ?? module);
        }
      })
      .catch((err) => {
        console.error("Failed to load Leaflet:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetch("/data/agrinet_global_map_layer.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((json) => setGeoJsonData(json))
      .catch((err) => {
        console.error("Failed to load GeoJSON:", err);
      });
  }, []);

  useEffect(() => {
    if (leaflet && geoJsonData && mapRef.current) {
      try {
        const bounds = leaflet.geoJSON(geoJsonData).getBounds();
        if (
          bounds && typeof bounds.isValid === "function"
            ? bounds.isValid()
            : true
        ) {
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (e) {
        console.warn("Could not fit bounds:", e);
      }
    }
  }, [leaflet, geoJsonData]);

  return (
    <Layout title="Agrinet Global Map">
      <div style={{ padding: 16 }}>
        <h1>Agrinet Global Map</h1>
        <p>
          This page loads the GeoJSON from{" "}
          <code>/data/agrinet_global_map_layer.geojson</code>. You can also
          download the file below.
        </p>

        <div style={{ height: 600, borderRadius: 6, overflow: "hidden" }}>
          <BrowserOnly fallback={<div style={{ padding: 16 }}>Loading map…</div>}>
            {() => {
              const { MapContainer, TileLayer, GeoJSON } = require("react-leaflet");

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
                      onEachFeature={(feature, layer) => {
                        const p = feature.properties || {};
                        const html = `
                          <div>
                            <strong>${p.node_name || "Unknown node"}</strong><br/>
                            <strong>Type:</strong> ${p.node_type || "—"}<br/>
                            <strong>Email:</strong> ${p.contact_email || "—"}<br/>
                            <strong>Languages:</strong> ${(p.languages || [])
                              .filter(Boolean)
                              .join(", ")}<br/>
                            <a href="${
                              p.fork_repo || "#"
                            }" target="_blank" rel="noreferrer">Fork repo</a>
                          </div>
                        `;
                        layer.bindPopup(html);
                      }}
                      style={() => ({
                        color: "#2b87ff",
                        weight: 2,
                        fillOpacity: 0.6,
                      })}
                    />
                  )}
                </MapContainer>
              );
            }}
          </BrowserOnly>
        </div>

        <p style={{ marginTop: 12 }}>
          <a href="/data/agrinet_global_map_layer.geojson" download>
            Download agrinet_global_map_layer.geojson
          </a>
        </p>
      </div>
    </Layout>
  );
}
