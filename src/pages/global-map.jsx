import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Page available at /global-map
 * - loads /data/agrinet_global_map_layer.geojson (from static/data/)
 * - displays GeoJSON on an OpenStreetMap base layer
 */

export default function GlobalMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch('/data/agrinet_global_map_layer.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((json) => setGeoJsonData(json))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load GeoJSON:', err);
      });
  }, []);

  useEffect(() => {
    // when data arrives, fit map bounds
    if (geoJsonData && mapRef.current) {
      try {
        const bounds = L.geoJSON(geoJsonData).getBounds();
        if (bounds.isValid && bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not fit bounds:', e);
      }
    }
  }, [geoJsonData]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Agrinet Global Map</h1>
      <p>
        This page loads the GeoJSON from <code>/data/agrinet_global_map_layer.geojson</code>.
        You can also download the file below.
      </p>

      <div style={{ height: 600, borderRadius: 6, overflow: 'hidden' }}>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
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
              // attach popups for each feature
              onEachFeature={(feature, layer) => {
                const p = feature.properties || {};
                const html = `
                  <div>
                    <strong>${p.node_name || 'Unknown node'}</strong><br/>
                    <strong>Type:</strong> ${p.node_type || '—'}<br/>
                    <strong>Email:</strong> ${p.contact_email || '—'}<br/>
                    <strong>Languages:</strong> ${(p.languages || []).join(', ')}<br/>
                    <a href="${p.fork_repo || '#'}" target="_blank" rel="noreferrer">Fork repo</a>
                  </div>
                `;
                layer.bindPopup(html);
              }}
              style={() => ({
                color: '#2b87ff',
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
  );
}
