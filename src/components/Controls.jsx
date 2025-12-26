import { useState } from 'react';
import { COMPONENTS, ALTITUDES, G_SCALE_LABELS } from '../constants';

export default function Controls({
  gScale,
  setGScale,
  currentGScale,
  kp,
  component,
  setComponent,
  altIdx,
  setAltIdx,
  threshold,
  setThreshold,
  viewMode,
  setViewMode,
  errorModel,
  setErrorModel
}) {
  const currentComponent = COMPONENTS.find(c => c.id === component);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <aside className="w-80 bg-gray-800 text-white p-6 space-y-6 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-1">
          <a
            href="https://www.ncei.noaa.gov/products/world-magnetic-model"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            World Magnetic Model Error Visualizer
          </a>
          <button
            onClick={() => setShowHelp(true)}
            className="ml-2 w-6 h-6 rounded-full border-2 border-gray-500 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors flex items-center justify-center text-sm font-bold"
            title="Help"
          >
            ?
          </button>
        </div>
        <p className="text-xs text-gray-400">
          {viewMode === 'altitude_limits'
            ? 'Maximum altitude where WMM is valid'
            : 'Magnetic field model errors vs. altitude'}
        </p>
      </div>

      {/* Help Popup */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[3000] p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-400">Understanding This Tool</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 text-sm">
              <p className="text-gray-300">
                This viewer shows where and how high the World Magnetic Model (WMM) remains accurate. The WMM is the standard model used worldwide for navigation, satellite attitude control, and compass calibration.
              </p>

              <div>
                <h3 className="font-semibold text-white mb-2">What the Maps Show</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><span className="font-semibold text-blue-400">Error Maps:</span> The magnitude of WMM error at each location for the selected altitude and geomagnetic conditions.</li>
                  <li><span className="font-semibold text-blue-400">Altitude Limit Maps:</span> The maximum altitude (in km) at which WMM errors stay within acceptable limits at each location. Green/yellow means reliable to higher altitudes; blue means reliability is limited to lower altitudes; white means the threshold is exceeded even at ground level.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Threshold Standards</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><span className="font-semibold text-orange-400">MilSpec:</span> The military performance specification (MIL-PRF-89500B) that WMM must meet throughout its 5-year lifespan. These are maximum allowable errors for operational use.</li>
                  <li><span className="font-semibold text-purple-400">WMM Error Model:</span> A stricter, realistic estimate of expected WMM accuracy based on known error sources including crustal anomalies and external field disturbances.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Geomagnetic Activity (G-Scale)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left border-r border-gray-600">Level</th>
                        <th className="px-3 py-2 text-left border-r border-gray-600">Conditions</th>
                        <th className="px-3 py-2 text-left">How Often</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-semibold border-r border-gray-600">G0</td>
                        <td className="px-3 py-2 border-r border-gray-600">Quiet (normal)</td>
                        <td className="px-3 py-2">~63% of time</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-semibold border-r border-gray-600">G1</td>
                        <td className="px-3 py-2 border-r border-gray-600">Minor storm</td>
                        <td className="px-3 py-2">~22%</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-semibold border-r border-gray-600">G2</td>
                        <td className="px-3 py-2 border-r border-gray-600">Moderate storm</td>
                        <td className="px-3 py-2">~9%</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-semibold border-r border-gray-600">G3</td>
                        <td className="px-3 py-2 border-r border-gray-600">Strong storm</td>
                        <td className="px-3 py-2">~4%</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-semibold border-r border-gray-600">G4</td>
                        <td className="px-3 py-2 border-r border-gray-600">Severe storm</td>
                        <td className="px-3 py-2">~2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-400 mt-2 italic text-xs">
                  Higher activity levels mean stronger disturbances from ionospheric and magnetospheric currents, which increase WMM errors and reduce the altitude range where the model is reliable.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Magnetic Components</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left border-r border-gray-600">Symbol</th>
                        <th className="px-3 py-2 text-left border-r border-gray-600">Name</th>
                        <th className="px-3 py-2 text-left">What It Represents</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">F</td>
                        <td className="px-3 py-2 border-r border-gray-600">Total Intensity</td>
                        <td className="px-3 py-2">Overall magnetic field strength</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">H</td>
                        <td className="px-3 py-2 border-r border-gray-600">Horizontal Intensity</td>
                        <td className="px-3 py-2">Horizontal field strength</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">D</td>
                        <td className="px-3 py-2 border-r border-gray-600">Declination</td>
                        <td className="px-3 py-2">Compass deviation from true north</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">I</td>
                        <td className="px-3 py-2 border-r border-gray-600">Inclination</td>
                        <td className="px-3 py-2">Field dip angle from horizontal</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">X</td>
                        <td className="px-3 py-2 border-r border-gray-600">North Component</td>
                        <td className="px-3 py-2">Northward field strength</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">Y</td>
                        <td className="px-3 py-2 border-r border-gray-600">East Component</td>
                        <td className="px-3 py-2">Eastward field strength</td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="px-3 py-2 font-mono font-bold border-r border-gray-600">Z</td>
                        <td className="px-3 py-2 border-r border-gray-600">Down Component</td>
                        <td className="px-3 py-2">Downward field strength</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <h3 className="font-semibold text-white mb-2">Reference</h3>
                <p className="text-gray-300 text-xs">
                  Based on: Nair, M., Fillion, M., Chulliat, A., & Califf, S. (2025). Global Geomagnetic Model Errors as a Function of Altitude and Geomagnetic Activity. <em>Space Weather</em>, <em>23</em>, e2025SW004579.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Selector */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          View Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setViewMode('altitude_limits')}
            className={`py-2.5 rounded font-semibold transition-colors ${
              viewMode === 'altitude_limits'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Altitude Limits
          </button>
          <button
            onClick={() => setViewMode('errors')}
            className={`py-2.5 rounded font-semibold transition-colors ${
              viewMode === 'errors'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Model Errors
          </button>
        </div>
      </div>

      {/* G-Scale Selector */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-300">
          Geomagnetic Activity Level
        </label>
        <div className="grid grid-cols-6 gap-1 mb-2">
          {[0, 1, 2, 3, 4, 5].map(g => (
            <button
              key={g}
              onClick={() => setGScale(g)}
              className={`relative py-2 rounded font-semibold transition-colors ${
                gScale === g
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              G{g}
              {/* Current G-scale indicator */}
              {currentGScale === g && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 italic">
          {G_SCALE_LABELS[gScale]}
        </p>

        {/* Current conditions info */}
        {currentGScale !== null && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-start gap-2 text-xs">
              <span className="text-gray-500">ℹ️</span>
              <div className="flex-1">
                <p className="text-gray-300">
                  Current: <span className="text-green-400 font-semibold">G{currentGScale}</span>
                  {kp !== null && ` (Kp=${kp.toFixed(1)})`}
                </p>
                <a
                  href="https://www.swpc.noaa.gov/noaa-scales-explanation#GeomagneticStorms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1 mt-1"
                >
                  About NOAA G-scales
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component Selector */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Magnetic Field Component
        </label>
        <select
          value={component}
          onChange={e => setComponent(e.target.value)}
          className="w-full bg-gray-700 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {COMPONENTS.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {currentComponent && (
          <p className="text-xs text-gray-400 mt-1 italic">
            {currentComponent.description}
          </p>
        )}
      </div>

      {/* Altitude Slider - Only show in errors view */}
      {viewMode === 'errors' && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Altitude: <span className="text-blue-400">{ALTITUDES[altIdx]} km</span>
          </label>
          <input
            type="range"
            min={0}
            max={ALTITUDES.length - 1}
            value={altIdx}
            onChange={e => setAltIdx(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 km</span>
            <span>10,000 km</span>
          </div>
        </div>
      )}

      {/* Error Threshold Standard - Show in altitude limits view */}
      {viewMode === 'altitude_limits' && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Error Threshold Standard
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setErrorModel('milspec')}
              className={`py-2.5 rounded font-semibold transition-colors ${
                errorModel === 'milspec'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              MilSpec
            </button>
            <button
              onClick={() => setErrorModel('wmm')}
              className={`py-2.5 rounded font-semibold transition-colors ${
                errorModel === 'wmm'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              WMM
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">
            {errorModel === 'milspec'
              ? 'Military specification thresholds for operational requirements'
              : 'WMM error model thresholds for scientific evaluation'}
          </p>
        </div>
      )}

      {/* Error Threshold Standard - Show in errors view */}
      {viewMode === 'errors' && (
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Error Threshold Standard
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setThreshold('MilSpec')}
              className={`py-2.5 rounded font-semibold transition-colors ${
                threshold === 'MilSpec'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              MilSpec
            </button>
            <button
              onClick={() => setThreshold('WMM')}
              className={`py-2.5 rounded font-semibold transition-colors ${
                threshold === 'WMM'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              WMM
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">
            {threshold === 'MilSpec'
              ? 'Military specification thresholds for operational requirements'
              : 'WMM error model thresholds for scientific evaluation'}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="pt-4 border-t border-gray-700 text-xs text-gray-400 space-y-1">
        {viewMode === 'errors' ? (
          <>
            <p>Grid: 18 lats × 36 lons × 29 altitudes</p>
            <p>Projection: Mollweide (equal-area)</p>
            <p>Map: Tile-based rendering</p>
            <p>Chart: Log-scale altitude profile</p>
          </>
        ) : (
          <>
            <p>Grid: 18 lats × 36 lons (2D)</p>
            <p>Projection: Mollweide (equal-area)</p>
            <p>Map: Maximum altitude per location</p>
            <p>Values: 0-10,000 km</p>
          </>
        )}
      </div>

      {/* Citation */}
      <div className="pt-3 border-t border-gray-700 text-xs text-gray-400">
        <p className="mb-1.5 text-gray-300 font-semibold">Based on research:</p>
        <p className="leading-relaxed">
          Nair, M., Fillion, M., Chulliat, A., & Califf, S. (2025). Global geomagnetic model errors as a function of altitude and geomagnetic activity. <em>Space Weather</em>, <em>23</em>(10), e2025SW004579.{' '}
          <a
            href="https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025SW004579"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            View paper ↗
          </a>
        </p>
      </div>
    </aside>
  );
}
