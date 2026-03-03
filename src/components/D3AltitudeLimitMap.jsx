import { useEffect, useRef, useState, useMemo } from 'react';
import { geoPath, geoGraticule } from 'd3-geo';
import { geoMollweide } from 'd3-geo-projection';
import { select } from 'd3-selection';
import { feature } from 'topojson-client';
import { COMPONENTS, jetColormapReversed, formatLon } from '../constants';

export default function D3AltitudeLimitMap({ data, component, errorModel, isEmbed = false }) {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const projectionRef = useRef(null); // Store projection for mouse events
  const [worldData, setWorldData] = useState(null);
  const [coastlineError, setCoastlineError] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, lat: 0, lon: 0, value: 0 });

  // Load world coastlines data (cached)
  useEffect(() => {
    fetch('/data/countries-110m.json')
      .then(response => {
        if (!response.ok) throw new Error('Coastline data not found');
        return response.json();
      })
      .then(topology => {
        const countries = feature(topology, topology.objects.countries);
        setWorldData(countries);
      })
      .catch(err => {
        console.error('Failed to load world data:', err);
        setCoastlineError(true);
      });
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

    // Store projection for mouse event handlers
    projectionRef.current = projection;

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
          ctx.fillStyle = jetColormapReversed(value, colorScale.min, colorScale.max);
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

  // Mouse event handlers for tooltip
  const handleMouseMove = (event) => {
    if (!data || !projectionRef.current || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Use inverse projection to get [lon, lat]
    const coords = projectionRef.current.invert([x, y]);
    if (!coords) {
      setTooltip({ visible: false, x: 0, y: 0, lat: 0, lon: 0, value: 0, latIdx: 0, lonIdx: 0 });
      return;
    }

    let [lon, lat] = coords;

    // Normalize longitude to [0, 360] to match data grid
    if (lon < 0) lon += 360;

    // Find nearest grid cell
    const lats = data.lats;
    const lons = data.lons;

    // Clamp lat/lon to grid bounds
    lat = Math.max(lats[0], Math.min(lats[lats.length - 1], lat));
    lon = Math.max(lons[0], Math.min(lons[lons.length - 1], lon));

    // Find nearest indices
    let latIdx = 0;
    let minLatDist = Math.abs(lat - lats[0]);
    for (let i = 1; i < lats.length; i++) {
      const dist = Math.abs(lat - lats[i]);
      if (dist < minLatDist) {
        minLatDist = dist;
        latIdx = i;
      }
    }

    let lonIdx = 0;
    let minLonDist = Math.abs(lon - lons[0]);
    for (let i = 1; i < lons.length; i++) {
      const dist = Math.abs(lon - lons[i]);
      if (dist < minLonDist) {
        minLonDist = dist;
        lonIdx = i;
      }
    }

    // Get value from altitude limit grid
    const fieldSuffix = errorModel === 'milspec' ? '_alt_limit_milspec' : '_alt_limit_wmm';
    const fieldName = `${component}${fieldSuffix}`;
    const grid = data[fieldName];
    const value = grid[latIdx][lonIdx];

    // Update tooltip
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      lat: lats[latIdx],
      lon: lons[lonIdx],
      value
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, lat: 0, lon: 0, value: 0 });
  };

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

      {/* Transparent overlay for mouse events */}
      <div
        ref={overlayRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Hover tooltip */}
      {tooltip.visible && (
        <div
          className="fixed bg-gray-900/95 border border-gray-600 rounded px-3 py-2 text-sm pointer-events-none shadow-lg z-[2000]"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`
          }}
        >
          <p className="text-gray-300">
            Lat: <span className="text-blue-400">{tooltip.lat}°</span>
          </p>
          <p className="text-gray-300">
            Lon: <span className="text-blue-400">{formatLon(tooltip.lon)}</span>
          </p>
          <p className="text-gray-300">
            Alt Limit: <span className="text-orange-400 font-semibold">
              {isNaN(tooltip.value) || tooltip.value === null ? 'Exceeded at ground' : `${tooltip.value?.toFixed(0)} km`}
            </span>
          </p>
        </div>
      )}

      {/* Info panel */}
      <div className={`absolute top-2 left-2 bg-gray-800/90 text-white rounded-lg shadow-lg backdrop-blur-sm z-[1000] pointer-events-none ${isEmbed ? 'px-2 py-1.5' : 'px-4 py-3 md:top-4 md:left-4'}`}>
        <h3 className={`font-semibold ${isEmbed ? 'text-xs' : 'text-xs md:text-sm'} mb-0.5`}>
          {currentComponent?.name} - Altitude Limit
        </h3>
        <p className="text-xs text-gray-300">
          {errorModel === 'milspec' ? 'MilSpec' : 'Error Model'} | {colorScale.dataMin?.toFixed(0)}-{colorScale.dataMax?.toFixed(0)} km
        </p>
      </div>

      {/* Color legend */}
      <ColorLegend
        component={currentComponent}
        colorScale={colorScale}
        isEmbed={isEmbed}
      />

      {/* Coastline error notice */}
      {coastlineError && (
        <div className="absolute top-2 right-2 bg-yellow-900/90 text-yellow-200 text-xs rounded px-3 py-2 z-[1000] pointer-events-none md:top-4 md:right-4">
          Coastlines unavailable
        </div>
      )}

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
function ColorLegend({ component, colorScale, isEmbed = false }) {
  const canvasRef = useRef(null);
  const canvasWidth = isEmbed ? 120 : 200;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvasWidth;
    const height = isEmbed ? 14 : 20;

    // Draw gradient
    for (let i = 0; i < width; i++) {
      const value = (i / width) * colorScale.max;
      ctx.fillStyle = jetColormapReversed(value, colorScale.min, colorScale.max);
      ctx.fillRect(i, 0, 1, height);
    }
  }, [colorScale, canvasWidth, isEmbed]);

  return (
    <div className={`absolute bottom-2 right-2 bg-gray-800/90 text-white rounded-lg shadow-lg backdrop-blur-sm z-[1000] pointer-events-none ${isEmbed ? 'px-2 py-1.5' : 'px-4 py-3 md:bottom-4 md:right-4'}`}>
      <h3 className={`font-semibold mb-1 ${isEmbed ? 'text-[10px]' : 'text-xs'}`}>Max Valid Altitude (km)</h3>
      <div className="flex items-center gap-1">
        <span className={isEmbed ? 'text-[10px]' : 'text-xs'}>{colorScale.min}</span>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={isEmbed ? 14 : 20}
          className="border border-gray-600 rounded"
        />
        <span className={isEmbed ? 'text-[10px]' : 'text-xs'}>{colorScale.max.toFixed(0)}</span>
      </div>
      {!isEmbed && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
          <div className="w-3 h-3 rounded" style={{ background: '#444', opacity: 0.5 }}></div>
          <span>Exceeded at ground level</span>
        </div>
      )}
    </div>
  );
}
