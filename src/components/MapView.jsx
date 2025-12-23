import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { THRESHOLDS, COMPONENTS, jetColormap } from '../constants';

// Custom hook to handle canvas overlay updates
function CanvasOverlay({ data, component, altIdx, threshold }) {
  const map = useMap();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!data || !data[component]) return;

    const grid = data[component];
    const lats = data.lats;
    const lons = data.lons;
    const thresholdValue = THRESHOLDS[threshold][component];
    const minVal = 0;
    const maxVal = thresholdValue; // Color scale from 0 to threshold

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = lons.length;
    canvas.height = lats.length;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    // Draw grid data to canvas using Jet colormap
    for (let latI = 0; latI < lats.length; latI++) {
      for (let lonI = 0; lonI < lons.length; lonI++) {
        const val = grid[latI][lonI][altIdx];

        // Use Jet colormap (handles NaN internally, values > threshold shown in white)
        ctx.fillStyle = jetColormap(val, minVal, maxVal);

        // Draw pixel (flip latitude because canvas origin is top-left)
        ctx.fillRect(lonI, lats.length - 1 - latI, 1, 1);
      }
    }

    // Create or update image overlay
    const bounds = [[-85, 5], [85, 365]]; // Match lat/lon grid bounds

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
    }

    overlayRef.current = L.imageOverlay(
      canvas.toDataURL(),
      bounds,
      { opacity: 0.7, interactive: false }
    ).addTo(map);

    // Cleanup function
    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
      }
    };
  }, [data, component, altIdx, threshold, map]);

  return null;
}

export default function MapView({ data, component, altIdx, threshold }) {
  const currentComponent = COMPONENTS.find(c => c.id === component);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[0, 180]}
        zoom={2}
        className="h-full w-full"
        worldCopyJump={true}
        minZoom={1}
        maxZoom={6}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <CanvasOverlay
          data={data}
          component={component}
          altIdx={altIdx}
          threshold={threshold}
        />
      </MapContainer>

      {/* Overlay info panel */}
      <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm z-[1000]">
        <h3 className="font-semibold text-sm mb-1">
          {currentComponent?.name}
        </h3>
        <p className="text-xs text-gray-300">
          Altitude: {data?.altitudes[altIdx]} km
        </p>
        <p className="text-xs text-gray-300">
          Threshold: {THRESHOLDS[threshold][component]} {currentComponent?.unit}
        </p>
      </div>

      {/* Instructions overlay when no data */}
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-[1000]">
          <div className="text-white text-center">
            <p className="text-lg">Loading map data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
