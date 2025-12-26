import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { ALTITUDES, THRESHOLDS, COMPONENTS } from '../constants';

export default function AltitudeNormalizedChart({ data, component, errorModel }) {
  // Check if this is an intensity component (needs normalization)
  const intensityComponents = ['F', 'H', 'X', 'Y', 'Z'];
  const isIntensityComponent = intensityComponents.includes(component);

  if (!data || !data[`profile_${component}`]) {
    return (
      <div className="h-56 bg-gray-800 flex items-center justify-center text-gray-400">
        Loading chart data...
      </div>
    );
  }

  // For intensity components, also need WMM field data
  if (isIntensityComponent && !data[`wmm_${component}_average`]) {
    return (
      <div className="h-56 bg-gray-800 flex items-center justify-center text-gray-400">
        Loading normalized chart data...
      </div>
    );
  }

  const profile = data[`profile_${component}`];
  const currentComponent = COMPONENTS.find(c => c.id === component);
  const unit = currentComponent?.unit || '';

  // Get threshold based on error model
  const thresholdKey = errorModel === 'milspec' ? 'MilSpec' : 'WMM';
  const threshold = THRESHOLDS[thresholdKey][component];

  let chartData, yAxisLabel, normalizedThreshold;

  if (isIntensityComponent) {
    // For intensity components (F, H, X, Y, Z): Use normalized errors (%)
    const wmmAverage = data[`wmm_${component}_average`];
    const wmmGround = wmmAverage[0];

    // Calculate normalized threshold (% relative to ground-level field)
    normalizedThreshold = (100 * threshold) / wmmGround;

    // Prepare normalized data for Recharts
    chartData = ALTITUDES
      .map((alt, i) => ({
        altitude: alt,
        error: (profile[i] / wmmAverage[i]) * 100  // Relative error %
      }))
      .filter(d => d.altitude >= 10 && d.error > 0); // Filter log(0) and negative values

    yAxisLabel = 'Normalized Error (%)';
  } else {
    // For angular components (D, I): Use absolute errors (same as Model Errors view)
    normalizedThreshold = threshold;

    chartData = ALTITUDES
      .map((alt, i) => ({
        altitude: alt,
        error: profile[i]
      }))
      .filter(d => d.altitude >= 10 && d.error > 0); // Filter log(0) and negative values

    yAxisLabel = `Error (${unit})`;
  }

  // Calculate Y-axis domain to include both data and threshold
  const errorValues = chartData.map(d => d.error).filter(v => v > 0);
  const maxError = Math.max(...errorValues);
  const minError = Math.min(...errorValues);

  // For log scale, ensure we don't include 0 or negative values
  // Domain should be powers of 10 for nice log scale
  const maxVal = Math.max(maxError, normalizedThreshold);
  const minVal = Math.min(minError, normalizedThreshold);

  const yMax = Math.pow(10, Math.ceil(Math.log10(maxVal)));
  const yMin = Math.pow(10, Math.floor(Math.log10(minVal)));

  // Generate log-scale ticks (powers of 10)
  const yTicks = [];
  let currentTick = yMin;
  while (currentTick <= yMax) {
    yTicks.push(currentTick);
    currentTick *= 10;
  }

  // Calculate altitude limit (where error exceeds threshold)
  // Detect multiple crossings and find exact crossing point
  let altitudeLimit = null;
  let crossingCount = 0;
  const startsAboveThreshold = chartData[0].error > normalizedThreshold;

  // Check if curve always stays above threshold
  const alwaysAboveThreshold = chartData.every(d => d.error > normalizedThreshold);

  // Count upward crossings (error exceeding threshold)
  for (let i = 0; i < chartData.length - 1; i++) {
    const curr = chartData[i];
    const next = chartData[i + 1];

    // Check if threshold is crossed upward between curr and next
    if (curr.error <= normalizedThreshold && next.error > normalizedThreshold) {
      crossingCount++;

      // Only calculate exact crossing for first upward crossing
      if (crossingCount === 1) {
        // Linear interpolation to find exact crossing altitude
        const fraction = (normalizedThreshold - curr.error) / (next.error - curr.error);
        const exactCrossing = curr.altitude + fraction * (next.altitude - curr.altitude);
        // Round down to nearest 100 km
        altitudeLimit = Math.floor(exactCrossing / 100) * 100;
      }
    }
  }

  // Check for "Exceeds" case:
  // - Curve always stays above threshold, OR
  // - Error exceeds at ground and crosses again, OR
  // - Crosses multiple times (exceeds → acceptable → exceeds)
  if (alwaysAboveThreshold || (startsAboveThreshold && crossingCount > 0) || crossingCount > 1) {
    altitudeLimit = "Exceeds";
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
            {isIntensityComponent
              ? `Normalized Error: ${data.error.toFixed(2)}%`
              : `Error: ${data.error.toFixed(2)} ${unit}`
            }
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isIntensityComponent
              ? `Threshold: ${normalizedThreshold.toFixed(2)}%`
              : `Threshold: ${normalizedThreshold.toFixed(2)} ${unit}`
            }
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
            {isIntensityComponent ? 'Normalized Error Profile vs Altitude' : 'Error Profile vs Altitude'}
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
            {altitudeLimit !== null && altitudeLimit !== "Exceeds" && (
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-8 border-l-2 border-dashed border-green-500"></div>
                <span className="text-gray-400">Limit: <span className="text-green-400 font-semibold">{altitudeLimit} km</span></span>
              </div>
            )}
            {altitudeLimit === "Exceeds" && (
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-semibold">Exceeds at all altitudes</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 italic mt-0.5">
          {isIntensityComponent
            ? 'Errors normalized by WMM field strength (%) - accounts for field weakening with altitude. Where does error exceed threshold?'
            : 'Absolute errors in degrees - angular quantities do not decay with altitude. Where does error exceed threshold?'}
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
            scale="log"
            domain={[yMin, yMax]}
            ticks={yTicks}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={(value) => {
              // Format log scale ticks nicely
              if (value >= 1) return value.toFixed(0);
              if (value >= 0.1) return value.toFixed(1);
              return value.toFixed(2);
            }}
            label={{
              value: yAxisLabel,
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
            y={normalizedThreshold}
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: isIntensityComponent
                ? `${thresholdKey}: ${normalizedThreshold.toFixed(2)}%`
                : `${thresholdKey}: ${normalizedThreshold.toFixed(2)} ${unit}`,
              position: 'right',
              fill: '#f97316',
              fontSize: 11
            }}
          />

          {/* Altitude limit indicator - vertical line where error exceeds threshold */}
          {altitudeLimit !== null && altitudeLimit !== "Exceeds" && (
            <ReferenceLine
              x={altitudeLimit}
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Limit: ${altitudeLimit} km`,
                position: 'top',
                fill: '#22c55e',
                fontSize: 11,
                fontWeight: 'bold'
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
