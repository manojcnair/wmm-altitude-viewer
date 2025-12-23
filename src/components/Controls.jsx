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

  return (
    <aside className="w-80 bg-gray-800 text-white p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-blue-400 mb-1">
          World Magnetic Model Error Visualizer
        </h1>
        <p className="text-xs text-gray-400">
          {viewMode === 'altitude_limits'
            ? 'Maximum altitude where WMM is valid'
            : 'Magnetic field model errors vs. altitude'}
        </p>
      </div>

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
