import { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { geoPath, geoGraticule } from 'd3-geo';
import { geoMollweide } from 'd3-geo-projection';
import { feature } from 'topojson-client';
import { THRESHOLDS, COMPONENTS, jetColormap } from '../constants';

// Create d3 object with needed functions
const d3 = {
  select,
  geoPath,
  geoMollweide,
  geoGraticule
};

export default function D3MapView({ data, component, altIdx, threshold }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [worldData, setWorldData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Load world coastlines data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries);
      })
      .catch(err => console.error('Failed to load world data:', err));
  }, []);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Render map
  useEffect(() => {
    if (!data || !data[component] || !svgRef.current || !worldData) return;

    const { width, height } = dimensions;
    const grid = data[component];
    const lats = data.lats;
    const lons = data.lons;
    const thresholdValue = THRESHOLDS[threshold][component];
    const currentComponent = COMPONENTS.find(c => c.id === component);

    // Clear previous render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create Mollweide projection
    const projection = d3.geoMollweide()
      .fitSize([width, height], { type: 'Sphere' })
      .precision(0.1);

    const path = d3.geoPath().projection(projection);

    // Create GeoJSON features for each grid cell (tile-based rendering)
    const gridFeatures = [];
    for (let latI = 0; latI < lats.length; latI++) {
      for (let lonI = 0; lonI < lons.length; lonI++) {
        const lat = lats[latI];
        const lon = lons[lonI];
        const value = grid[latI][lonI][altIdx];

        // Create a polygon for this cell (10° × 10° tile)
        // Shift entire tile to [-180, 180] based on center longitude
        const centerShift = lon > 180 ? -360 : 0;
        const lonMin = lon - 5 + centerShift;
        const lonMax = lon + 5 + centerShift;
        const latMin = Math.max(-90, lat - 5);
        const latMax = Math.min(90, lat + 5);

        gridFeatures.push({
          type: 'Feature',
          properties: { value, lat, lon },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lonMin, latMin],
              [lonMax, latMin],
              [lonMax, latMax],
              [lonMin, latMax],
              [lonMin, latMin]
            ]]
          }
        });
      }
    }

    const gridGeoJson = { type: 'FeatureCollection', features: gridFeatures };

    // Draw ocean background (sphere)
    svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'ocean')
      .attr('d', path)
      .attr('fill', '#1a1a2e')
      .attr('stroke', 'none');

    // Draw grid tiles
    svg.selectAll('path.grid-cell')
      .data(gridGeoJson.features)
      .join('path')
      .attr('class', 'grid-cell')
      .attr('d', path)
      .attr('fill', d => jetColormap(d.properties.value, 0, thresholdValue))
      .attr('stroke', 'none')
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        // Highlight on hover
        d3.select(this).attr('opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1);

        // Show tooltip
        const tooltip = d3.select('#map-tooltip');
        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px')
          .html(`
            <strong>Lat:</strong> ${d.properties.lat}°<br>
            <strong>Lon:</strong> ${d.properties.lon}°<br>
            <strong>Error:</strong> ${d.properties.value?.toFixed(2) || 'N/A'} ${currentComponent?.unit || ''}
          `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8).attr('stroke', 'none');
        d3.select('#map-tooltip').style('display', 'none');
      });

    // Draw coastlines on top
    svg.append('path')
      .datum(worldData)
      .attr('class', 'coastlines')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.6);

    // Draw graticule (lat/lon grid lines)
    const graticule = d3.geoGraticule()
      .step([30, 30]);

    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#444')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);

    // Draw sphere outline
    svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere-outline')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 1.5);

  }, [data, component, altIdx, threshold, worldData, dimensions]);

  const currentComponent = COMPONENTS.find(c => c.id === component);
  const thresholdValue = THRESHOLDS[threshold][component];

  return (
    <div ref={containerRef} className="relative h-full w-full bg-gray-900">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />

      {/* Tooltip */}
      <div
        id="map-tooltip"
        className="absolute bg-gray-800/95 text-white px-3 py-2 rounded-lg shadow-lg text-xs pointer-events-none z-[2000]"
        style={{ display: 'none' }}
      />

      {/* Info panel */}
      <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm z-[1000]">
        <h3 className="font-semibold text-sm mb-1">
          {currentComponent?.name}
        </h3>
        <p className="text-xs text-gray-300">
          Altitude: {data?.altitudes[altIdx]} km
        </p>
        <p className="text-xs text-gray-300">
          Threshold: {thresholdValue} {currentComponent?.unit}
        </p>
      </div>

      {/* Color legend */}
      <ColorLegend
        component={currentComponent}
        threshold={thresholdValue}
      />

      {/* Loading overlay */}
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

// Color legend component
function ColorLegend({ component, threshold }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 200;
    const height = 20;

    // Draw gradient
    for (let i = 0; i < width; i++) {
      const value = (i / width) * threshold;
      ctx.fillStyle = jetColormap(value, 0, threshold);
      ctx.fillRect(i, 0, 1, height);
    }
  }, [threshold]);

  return (
    <div className="absolute bottom-4 right-4 bg-gray-800/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm z-[1000]">
      <h3 className="font-semibold text-xs mb-2">Error Scale ({component?.unit})</h3>
      <div className="flex items-center gap-2">
        <span className="text-xs">0</span>
        <canvas
          ref={canvasRef}
          width={200}
          height={20}
          className="border border-gray-600 rounded"
        />
        <span className="text-xs">{threshold}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center">
        White = exceeds threshold
      </p>
    </div>
  );
}
