import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Customized,
} from 'recharts';
import { ALTITUDES, THRESHOLDS, COMPONENTS } from '../constants';

const SAT_COLORS = {
  'Swarm A': '#f472b6',   // pink
  'Swarm B': '#a78bfa',   // purple
  'CHAMP': '#34d399',     // green
  'CryoSat-2': '#fbbf24', // amber
};

const SAT_SHAPES = {
  'Swarm A': 'circle',
  'Swarm B': 'diamond',
  'CHAMP': 'triangle',
  'CryoSat-2': 'square',
};

// Draw a satellite marker shape at (cx, cy) in SVG
function drawShape(cx, cy, fill, shape, size = 6) {
  switch (shape) {
    case 'diamond':
      return <polygon points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`} fill={fill} stroke="#fff" strokeWidth={0.5} />;
    case 'triangle':
      return <polygon points={`${cx},${cy - size} ${cx + size},${cy + size} ${cx - size},${cy + size}`} fill={fill} stroke="#fff" strokeWidth={0.5} />;
    case 'square':
      return <rect x={cx - size + 1} y={cy - size + 1} width={(size - 1) * 2} height={(size - 1) * 2} fill={fill} stroke="#fff" strokeWidth={0.5} />;
    default:
      return <circle cx={cx} cy={cy} r={size - 1} fill={fill} stroke="#fff" strokeWidth={0.5} />;
  }
}

// Legend shape (smaller, no stroke)
function LegendShape({ fill, shape }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      {drawShape(6, 6, fill, shape, 5)}
    </svg>
  );
}

export default function AltitudeChart({ data, component, threshold, satelliteData, gScale }) {
  const [hoveredSat, setHoveredSat] = useState(null);

  if (!data || !data[`profile_${component}`]) {
    return (
      <div className="h-56 bg-gray-800 flex items-center justify-center text-gray-400">
        Loading chart data...
      </div>
    );
  }

  const profile = data[`profile_${component}`];
  const currentComponent = COMPONENTS.find(c => c.id === component);
  const unit = currentComponent?.unit || '';
  const thresh = THRESHOLDS[threshold][component];

  // Prepare line data (filter out altitudes < 10 km for log scale)
  const chartData = ALTITUDES
    .map((alt, i) => ({
      altitude: alt,
      error: profile[i]
    }))
    .filter(d => d.altitude >= 10);

  // Build satellite scatter data (G0-G4 only, no G5)
  const satPoints = [];
  if (satelliteData && gScale != null && gScale <= 4) {
    for (const sat of satelliteData.satellites) {
      const val = sat.errors[component]?.[gScale];
      if (val != null) {
        satPoints.push({
          altitude: sat.altitude,
          error: val,
          name: sat.name,
        });
      }
    }
  }

  // Calculate Y-axis domain including satellite points
  const errorValues = chartData.map(d => d.error);
  const allValues = [...errorValues, thresh];
  for (const pt of satPoints) allValues.push(pt.error);
  const maxVal = Math.max(...allValues);
  const minVal = Math.min(...allValues);

  const yMax = maxVal * 1.1;
  const yMin = minVal * 0.9;

  // Calculate nice tick spacing
  const range = yMax - yMin;
  const tickCount = 5;
  const rawStep = range / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceFraction = rawStep / magnitude;
  let niceStep;
  if (niceFraction <= 1) niceStep = magnitude;
  else if (niceFraction <= 2) niceStep = 2 * magnitude;
  else if (niceFraction <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const yTicks = [];
  const firstTick = Math.ceil(yMin / niceStep) * niceStep;
  for (let i = 0; i < 10; i++) {
    const tick = firstTick + i * niceStep;
    if (tick > yMax) break;
    yTicks.push(tick);
  }

  // Custom tooltip for the line only
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded px-3 py-2 text-sm">
          <p className="font-semibold text-white">
            {d.altitude.toLocaleString()} km
          </p>
          <p className="text-blue-400">
            Error: {d.error.toFixed(2)} {unit}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Threshold: {thresh} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render satellite dots using Customized (direct SVG via axis scales)
  const SatelliteDotsLayer = ({ xAxisMap, yAxisMap }) => {
    if (!satPoints.length) return null;
    const xAxis = Object.values(xAxisMap)[0];
    const yAxis = Object.values(yAxisMap)[0];
    if (!xAxis?.scale || !yAxis?.scale) return null;

    return (
      <g>
        {satPoints.map((pt) => {
          const cx = xAxis.scale(pt.altitude);
          const cy = yAxis.scale(pt.error);
          if (isNaN(cx) || isNaN(cy)) return null;
          const color = SAT_COLORS[pt.name];
          const shape = SAT_SHAPES[pt.name];
          return (
            <g key={pt.name}>
              {drawShape(cx, cy, color, shape, 7)}
              {/* Invisible larger hit area for hover */}
              <circle
                cx={cx}
                cy={cy}
                r={14}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredSat({ ...pt, cx, cy })}
                onMouseLeave={() => setHoveredSat(null)}
              />
            </g>
          );
        })}
      </g>
    );
  };

  const hasSatData = satPoints.length > 0;

  return (
    <div className="bg-gray-800 p-4 relative" style={{ height: '300px' }}>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">
            {currentComponent?.name} — Global Avg RMS Error vs Altitude
          </h3>
          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <span className="text-gray-400">Global Avg RMS Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-orange-500"></div>
              <span className="text-gray-400">{threshold} Threshold</span>
            </div>
            {hasSatData && Object.entries(SAT_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <LegendShape fill={color} shape={SAT_SHAPES[name]} />
                <span className="text-gray-400">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 italic mt-0.5">
          Shows global average RMS error at each altitude{hasSatData ? ' with satellite-derived observations' : ''}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 60, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

          <XAxis
            type="number"
            dataKey="altitude"
            scale="log"
            domain={[10, 10000]}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            ticks={[10, 50, 100, 500, 1000, 5000, 10000]}
            label={{
              value: 'Altitude (km)',
              position: 'bottom',
              style: { fill: '#9ca3af', fontSize: 12 }
            }}
          />

          <YAxis
            type="number"
            domain={[yMin, yMax]}
            ticks={yTicks}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={(value) => {
              if (Math.abs(value) < 1 && value !== 0) return value.toFixed(2);
              if (Math.abs(value) < 10) return value.toFixed(1);
              return value.toFixed(0);
            }}
            label={{
              value: `Error (${unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#9ca3af', fontSize: 12, textAnchor: 'middle' }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="error"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />

          <ReferenceLine
            y={thresh}
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `${threshold}: ${thresh} ${unit}`,
              position: 'right',
              fill: '#f97316',
              fontSize: 11
            }}
          />

          <Customized component={SatelliteDotsLayer} />
        </LineChart>
      </ResponsiveContainer>

      {/* Satellite hover tooltip (positioned via CSS, outside the SVG) */}
      {hoveredSat && (
        <div
          className="absolute pointer-events-none bg-gray-900/95 border border-gray-700 rounded px-3 py-2 text-sm z-50"
          style={{ left: hoveredSat.cx + 70, top: hoveredSat.cy + 10 }}
        >
          <p className="font-semibold" style={{ color: SAT_COLORS[hoveredSat.name] }}>
            {hoveredSat.name}
          </p>
          <p className="text-white">{hoveredSat.altitude} km</p>
          <p className="text-gray-300">
            RMS Error: {hoveredSat.error.toFixed(2)} {unit}
          </p>
        </div>
      )}
    </div>
  );
}
