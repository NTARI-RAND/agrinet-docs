import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import Layout from "@theme/Layout";
// Leaflet CSS is loaded from docusaurus.config.js stylesheets, so we do not import it here.

export default function GlobalMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
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
      } catch (e) {
        console.warn("Could not fit bounds:", e);
      }
    }
  }, [geoJsonData]);

  if (!isBrowser) {
    return (
      <Layout title="Agrinet Global Map">
        <div style={{ padding: 16 }}>
          <h1>Agrinet Global Map</h1>
          <p>Loading map…</p>
        </div>
      </Layout>
    );
  }

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
                      <strong>Languages:</strong> ${(p.languages || []).join(
                        ", "
                      )}<br/>
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
