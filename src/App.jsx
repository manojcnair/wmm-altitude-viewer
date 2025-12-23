import { useState, useEffect } from 'react';
import D3MapViewOptimized from './components/D3MapViewOptimized';
import D3AltitudeLimitMap from './components/D3AltitudeLimitMap';
import Controls from './components/Controls';
import AltitudeChart from './components/AltitudeChart';
import AltitudeNormalizedChart from './components/AltitudeNormalizedChart';
import { useCurrentGScale } from './hooks/useCurrentGScale';
import { ALTITUDES } from './constants';

export default function App() {
  // Fetch current geomagnetic conditions from NOAA
  const { currentGScale, kp, isLoading: forecastLoading } = useCurrentGScale();

  const [gScale, setGScale] = useState(null);
  const [component, setComponent] = useState('F');
  const [altIdx, setAltIdx] = useState(13); // 400 km - mid-LEO altitude
  const [threshold, setThreshold] = useState('MilSpec');
  const [viewMode, setViewMode] = useState('altitude_limits'); // 'errors' or 'altitude_limits'
  const [errorModel, setErrorModel] = useState('milspec'); // 'milspec' or 'wmm' (for altitude limits view)
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default G-scale to current conditions when forecast loads
  useEffect(() => {
    if (!forecastLoading && currentGScale !== null && gScale === null) {
      setGScale(currentGScale);
    }
  }, [forecastLoading, currentGScale, gScale]);

  // Load data when G-scale changes
  useEffect(() => {
    if (gScale === null) return; // Wait for initial G-scale to be set
    setLoading(true);
    setError(null);

    fetch(`/data/G${gScale}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load G${gScale}.json - Have you exported the MATLAB data?`);
        }
        return response.json();
      })
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        console.error('Data loading error:', err);
      });
  }, [gScale]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading G{gScale} data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-lg px-4">
          <div className="text-red-500 text-6xl mb-4">⚠</div>
          <h2 className="text-2xl font-bold mb-2">Data Not Found</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="bg-gray-800 rounded-lg p-4 text-left text-sm">
            <p className="font-semibold mb-2">To get started:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-400">
              <li>Run the <code className="bg-gray-700 px-1 rounded">export_wmm_for_web.m</code> script in MATLAB</li>
              <li>Copy the generated <code className="bg-gray-700 px-1 rounded">wmm_web_data</code> folder to <code className="bg-gray-700 px-1 rounded">public/data</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900">
      <Controls
        gScale={gScale}
        setGScale={setGScale}
        currentGScale={currentGScale}
        kp={kp}
        component={component}
        setComponent={setComponent}
        altIdx={altIdx}
        setAltIdx={setAltIdx}
        threshold={threshold}
        setThreshold={setThreshold}
        viewMode={viewMode}
        setViewMode={setViewMode}
        errorModel={errorModel}
        setErrorModel={setErrorModel}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          {viewMode === 'errors' ? (
            <D3MapViewOptimized
              data={data}
              component={component}
              altIdx={altIdx}
              threshold={threshold}
            />
          ) : (
            <D3AltitudeLimitMap
              data={data}
              component={component}
              errorModel={errorModel}
            />
          )}
        </div>
        {viewMode === 'errors' && (
          <AltitudeChart
            data={data}
            component={component}
            threshold={threshold}
          />
        )}
        {viewMode === 'altitude_limits' && (
          <AltitudeNormalizedChart
            data={data}
            component={component}
            errorModel={errorModel}
          />
        )}
      </div>
    </div>
  );
}
