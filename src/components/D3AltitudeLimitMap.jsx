import { useEffect, useRef, useState, useMemo } from 'react';
import { geoPath, geoGraticule } from 'd3-geo';
import { geoMollweide } from 'd3-geo-projection';
import { select } from 'd3-selection';
import { feature } from 'topojson-client';
import { COMPONENTS, jetColormap } from '../constants';

export default function D3AltitudeLimitMap({ data, component, errorModel }) {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [worldData, setWorldData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Load world coastlines data (cached)
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
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate data-driven color scale (memoized)
  const colorScale = useMemo(() => {
    if (!data) return { min: 0, max: 10000 };

    // Get altitude limit field name based on error model
    const fieldSuffix = errorModel === 'milspec' ? '_alt_limit_milspec' : '_alt_limit_wmm';
    const fieldName = `${component}${fieldSuffix}`;
    const grid = data[fieldName];

    if (!grid) return { min: 0, max: 10000 };

    const values = [];
    for (let latI = 0; latI < grid.length; latI++) {
      for (let lonI = 0; lonI < grid[latI].length; lonI++) {
        const val = grid[latI][lonI];
        if (!isNaN(val) && val !== null) {
          values.push(val);
        }
      }
    }

    if (values.length === 0) return { min: 0, max: 10000 };

    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      min: 0,
      max: 10000, // Fixed scale for altitude limits
      dataMin: min,
      dataMax: max
    };
  }, [data, component, errorModel]);

  // Render map using Canvas for tiles, SVG for overlays
  useEffect(() => {
    if (!data || !canvasRef.current || !svgRef.current || !worldData) return;

    const { width, height } = dimensions;
    const lats = data.lats;
    const lons = data.lons;
    const currentComponent = COMPONENTS.find(c => c.id === component);

    // Get altitude limit grid based on error model
    const fieldSuffix = errorModel === 'milspec' ? '_alt_limit_milspec' : '_alt_limit_wmm';
    const fieldName = `${component}${fieldSuffix}`;
    const grid = data[fieldName];

    if (!grid) {
      console.warn(`Altitude limit data not found: ${fieldName}`);
      return;
    }

    // Create projection
    const projection = geoMollweide()
      .fitSize([width, height], { type: 'Sphere' })
      .precision(0.1);

    const path = geoPath().projection(projection);

    // CANVAS: Render colored tiles (fast!)
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw ocean background
    const spherePath = new Path2D(path({ type: 'Sphere' }));
    ctx.fillStyle = '#1a1a2e';
    ctx.fill(spherePath);

    // Draw grid tiles to canvas
    for (let latI = 0; latI < lats.length; latI++) {
      for (let lonI = 0; lonI < lons.length; lonI++) {
        const lat = lats[latI];
        const lon = lons[lonI];
        const value = grid[latI][lonI];

        // Define tile corners
        // Shift entire tile to [-180, 180] based on center longitude
        const centerShift = lon > 180 ? -360 : 0;
        const lonMin = lon - 5 + centerShift;
        const lonMax = lon + 5 + centerShift;
        const latMin = Math.max(-90, lat - 5);
        const latMax = Math.min(90, lat + 5);

        // Project corners
        const corners = [
          projection([lonMin, latMin]),
          projection([lonMax, latMin]),
          projection([lonMax, latMax]),
          projection([lonMin, latMax])
        ];

        // Skip if any corner is null (outside projection)
        if (corners.some(c => c === null)) continue;

        // Draw filled polygon
        ctx.beginPath();
        ctx.moveTo(corners[0][0], corners[0][1]);
        for (let i = 1; i < corners.length; i++) {
          ctx.lineTo(corners[i][0], corners[i][1]);
        }
        ctx.closePath();

        // Handle NaN values (display as gray)
        if (isNaN(value) || value === null) {
          ctx.fillStyle = '#444';
          ctx.globalAlpha = 0.5;
        } else {
          ctx.fillStyle = jetColormap(value, colorScale.min, colorScale.max);
          ctx.globalAlpha = 0.8;
        }
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    // SVG: Render coastlines and graticule (interactive, on top)
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Graticule
    const graticule = geoGraticule().step([30, 30]);
    svg.append('path')
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#444')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3);

    // Coastlines
    svg.append('path')
      .datum(worldData)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9);

    // Sphere outline
    svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 1.5);

  }, [data, component, errorModel, worldData, dimensions, colorScale]);

  const currentComponent = COMPONENTS.find(c => c.id === component);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-gray-900">
      {/* Canvas layer (colored tiles) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* SVG layer (coastlines, graticule) */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Info panel */}
      <div className="absolute top-4 left-4 bg-gray-800/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm z-[1000] pointer-events-none">
        <h3 className="font-semibold text-sm mb-1">
          {currentComponent?.name} - Altitude Limit
        </h3>
        <p className="text-xs text-gray-300">
          Error Model: {errorModel === 'milspec' ? 'MilSpec' : 'WMM Error'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Range: {colorScale.dataMin?.toFixed(0)} - {colorScale.dataMax?.toFixed(0)} km
        </p>
      </div>

      {/* Color legend */}
      <ColorLegend
        component={currentComponent}
        colorScale={colorScale}
      />

      {/* Loading overlay */}
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-[1000] pointer-events-none">
          <div className="text-white text-center">
            <p className="text-lg">Loading map data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Color legend component
function ColorLegend({ component, colorScale }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 200;
    const height = 20;

    // Draw gradient
    for (let i = 0; i < width; i++) {
      const value = (i / width) * colorScale.max;
      ctx.fillStyle = jetColormap(value, colorScale.min, colorScale.max);
      ctx.fillRect(i, 0, 1, height);
    }
  }, [colorScale]);

  return (
    <div className="absolute bottom-4 right-4 bg-gray-800/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm z-[1000] pointer-events-none">
      <h3 className="font-semibold text-xs mb-2">Altitude Scale (km)</h3>
      <div className="flex items-center gap-2">
        <span className="text-xs">{colorScale.min}</span>
        <canvas
          ref={canvasRef}
          width={200}
          height={20}
          className="border border-gray-600 rounded"
        />
        <span className="text-xs">{colorScale.max.toFixed(0)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Data: {colorScale.dataMin?.toFixed(0)}-{colorScale.dataMax?.toFixed(0)} km</span>
      </div>
    </div>
  );
}
