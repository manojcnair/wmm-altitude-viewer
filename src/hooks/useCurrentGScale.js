import { useState, useEffect } from 'react';
import { fetchCurrentGScale } from '../utils/noaaForecast';

/**
 * React hook for fetching and managing current geomagnetic G-scale from NOAA
 *
 * Fetches the current G-scale forecast on mount and provides:
 * - Current G-scale value (0-5)
 * - Kp index value
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadForecast() {
      try {
        setIsLoading(true);
        setError(null);

        const forecast = await fetchCurrentGScale();

        if (!isMounted) return;

        setCurrentGScale(forecast.gScale);
        setKp(forecast.kp);
        setGScaleName(forecast.gScaleName);
        setDescription(forecast.description);
        setLastUpdated(forecast.fetchedAt);
        setIsStale(forecast.isStale || false);

      } catch (err) {
        if (!isMounted) return;

        console.error('Failed to load NOAA forecast:', err);
        setError(err.message);

        // Default to G0 (Quiet) if fetch fails
        setCurrentGScale(0);
        setKp(null);
        setGScaleName('Quiet');
        setDescription('Live forecast unavailable');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadForecast();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    currentGScale,
    kp,
    gScaleName,
    description,
    isLoading,
    error,
    lastUpdated,
    isStale
  };
}
