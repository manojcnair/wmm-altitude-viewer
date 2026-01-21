import { useState, useEffect } from 'react';
import { fetchCurrentGScale } from '../utils/noaaForecast';

/**
 * React hook for fetching and managing current geomagnetic G-scale from NOAA
 *
 * Fetches the current G-scale on mount and provides:
 * - Current G-scale value (0-5)
 * - Kp index value
 * - Data source (observed or forecast)
 * - Loading and error states
 * - Timestamp of last update
 * - Staleness indicator
 *
 * @returns {object} Hook state
 */
export function useCurrentGScale() {
  const [currentGScale, setCurrentGScale] = useState(null);
  const [kp, setKp] = useState(null);
  const [gScaleName, setGScaleName] = useState(null);
  const [description, setDescription] = useState(null);
  const [source, setSource] = useState(null); // 'observed' or 'forecast'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchCurrentGScale();

        if (!isMounted) return;

        setCurrentGScale(data.gScale);
        setKp(data.kp);
        setGScaleName(data.gScaleName);
        setDescription(data.description);
        setSource(data.source || 'forecast');
        setLastUpdated(data.fetchedAt);
        setIsStale(data.isStale || false);

      } catch (err) {
        if (!isMounted) return;

        console.error('Failed to load NOAA data:', err);
        setError(err.message);

        // Default to G0 (Quiet) if fetch fails
        setCurrentGScale(0);
        setKp(null);
        setGScaleName('Quiet');
        setDescription('Live data unavailable');
        setSource(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    currentGScale,
    kp,
    gScaleName,
    description,
    source,
    isLoading,
    error,
    lastUpdated,
    isStale
  };
}
