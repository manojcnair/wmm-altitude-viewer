import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label
} from 'recharts';
import { ALTITUDES, THRESHOLDS, COMPONENTS } from '../constants';

export default function AltitudeChart({ data, component, threshold }) {
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

  // Prepare data for Recharts
  // Filter out altitudes below 10 km since the X-axis uses log scale with domain [10, 10000]
  // (log(0) is undefined, which prevents the chart from rendering)
  const chartData = ALTITUDES
    .map((alt, i) => ({
      altitude: alt,
      error: profile[i]
    }))
    .filter(d => d.altitude >= 10);

  // Calculate Y-axis domain to include both data and threshold
  const errorValues = chartData.map(d => d.error);
  const maxError = Math.max(...errorValues);
  const minError = Math.min(...errorValues);

  // Ensure threshold is visible in the chart
  const yMax = Math.max(maxError, thresh) * 1.1; // Add 10% padding
  const yMin = Math.min(minError, thresh) * 0.9; // Subtract 10% padding (or add if negative)

  // Calculate nice tick spacing
  const range = yMax - yMin;
  const tickCount = 5;
  const rawStep = range / (tickCount - 1);
  // Round step to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceFraction = rawStep / magnitude;
  let niceStep;
  if (niceFraction <= 1) niceStep = magnitude;
  else if (niceFraction <= 2) niceStep = 2 * magnitude;
  else if (niceFraction <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  // Generate ticks
  const yTicks = [];
  const firstTick = Math.ceil(yMin / niceStep) * niceStep;
  for (let i = 0; i < 10; i++) { // Max 10 ticks
    const tick = firstTick + i * niceStep;
    if (tick > yMax) break;
    yTicks.push(tick);
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded px-3 py-2 text-sm">
          <p className="font-semibold text-white">
            {data.altitude.toLocaleString()} km
          </p>
          <p className="text-blue-400">
            Error: {data.error.toFixed(2)} {unit}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Threshold: {thresh} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 p-4" style={{ height: '300px' }}>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">
            How Errors Scale with Altitude
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-400"></div>
              <span className="text-gray-400">Profile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-orange-500"></div>
              <span className="text-gray-400">Threshold</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 italic mt-0.5">
          Shows global average error at each altitude
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
            tickFormatter={(value) => value.toFixed(0)}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
