/**
 * NOAA Space Weather Forecast Integration
 *
 * Fetches and parses the 3-day geomagnetic forecast from NOAA SWPC
 * to determine the current G-scale (geomagnetic activity level).
 *
 * Data source: https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt
 * Documentation: https://www.swpc.noaa.gov/noaa-scales-explanation
 */

const NOAA_FORECAST_URL = 'https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt';
const CACHE_KEY = 'noaa_geomag_forecast';
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Convert Kp index to G-scale
 *
 * NOAA G-scale classification:
 * - G5 (Extreme): Kp >= 9
 * - G4 (Severe): Kp >= 8
 * - G3 (Strong): Kp >= 7
 * - G2 (Moderate): Kp >= 6
 * - G1 (Minor): Kp >= 5
 * - G0 (Quiet): Kp < 5 (custom level for this application)
 *
 * @param {number} kp - Kp index value (0-9)
 * @returns {number} G-scale value (0-5)
 */
export function kpToGScale(kp) {
  if (kp >= 9) return 5;  // G5 - Extreme
  if (kp >= 8) return 4;  // G4 - Severe
  if (kp >= 7) return 3;  // G3 - Strong
  if (kp >= 6) return 2;  // G2 - Moderate
  if (kp >= 5) return 1;  // G1 - Minor
  return 0;               // G0 - Quiet (Kp < 5)
}

/**
 * Get G-scale name and description
 *
 * @param {number} gScale - G-scale value (0-5)
 * @returns {object} Object with name and description
 */
export function getGScaleInfo(gScale) {
  const info = {
    0: { name: 'Quiet', description: 'Quiet conditions' },
    1: { name: 'Minor', description: 'Minor geomagnetic storm' },
    2: { name: 'Moderate', description: 'Moderate geomagnetic storm' },
    3: { name: 'Strong', description: 'Strong geomagnetic storm' },
    4: { name: 'Severe', description: 'Severe geomagnetic storm' },
    5: { name: 'Extreme', description: 'Extreme geomagnetic storm' }
  };
  return info[gScale] || info[0];
}

/**
 * Parse NOAA 3-day geomagnetic forecast text file
 *
 * Expected format:
 * ```
 * Product: Geomagnetic Forecast
 * Issued: 2025 Dec 22 2205 UTC
 * ...
 * NOAA Kp index forecast 23 Dec - 25 Dec
 *             23 Dec      24 Dec      25 Dec
 * 00-03UT        4.67        3.67        2.67
 * 03-06UT        4.33        3.33        2.33
 * ...
 * ```
 *
 * @param {string} textData - Raw text from NOAA forecast file
 * @returns {object} Parsed forecast data or null if parsing fails
 */
export function parseNOAAForecast(textData) {
  try {
    // Extract issue timestamp
    const issuedMatch = textData.match(/Issued:\s*(\d{4}\s+\w+\s+\d{2}\s+\d{4})\s+UTC/);
    const issuedTimestamp = issuedMatch ? issuedMatch[1] : 'Unknown';

    // Get current UTC hour to find the appropriate forecast period
    const now = new Date();
    const currentUTCHour = now.getUTCHours();

    // Determine which 3-hour period we're in
    // Periods: 00-03, 03-06, 06-09, 09-12, 12-15, 15-18, 18-21, 21-00
    let timeWindow;
    if (currentUTCHour >= 0 && currentUTCHour < 3) {
      timeWindow = '00-03UT';
    } else if (currentUTCHour >= 3 && currentUTCHour < 6) {
      timeWindow = '03-06UT';
    } else if (currentUTCHour >= 6 && currentUTCHour < 9) {
      timeWindow = '06-09UT';
    } else if (currentUTCHour >= 9 && currentUTCHour < 12) {
      timeWindow = '09-12UT';
    } else if (currentUTCHour >= 12 && currentUTCHour < 15) {
      timeWindow = '12-15UT';
    } else if (currentUTCHour >= 15 && currentUTCHour < 18) {
      timeWindow = '15-18UT';
    } else if (currentUTCHour >= 18 && currentUTCHour < 21) {
      timeWindow = '18-21UT';
    } else {
      timeWindow = '21-00UT';
    }

    // Find the Kp forecast section
    const kpSectionMatch = textData.match(/NOAA Kp index forecast[\s\S]*?(\d{2}-\d{2}UT\s+[\d.]+)/);
    if (!kpSectionMatch) {
      console.error('Could not find Kp forecast section');
      return null;
    }

    // Extract Kp value for the current time window
    const regex = new RegExp(timeWindow + '\\s+([\\d.]+)');
    const currentKpMatch = textData.match(regex);

    // Fallback to first value if current window not found
    const kpMatch = currentKpMatch || textData.match(/00-03UT\s+([\d.]+)/);

    if (!kpMatch) {
      console.error('Could not extract Kp value from forecast');
      return null;
    }

    const kp = parseFloat(kpMatch[1]);
    const gScale = kpToGScale(kp);
    const gScaleInfo = getGScaleInfo(gScale);

    return {
      gScale,
      kp,
      gScaleName: gScaleInfo.name,
      description: gScaleInfo.description,
      issuedTimestamp,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing NOAA forecast:', error);
    return null;
  }
}

/**
 * Fetch current geomagnetic forecast from NOAA SWPC
 *
 * @returns {Promise<object>} Forecast data with gScale, kp, timestamp, etc.
 * @throws {Error} If fetch fails or parsing fails
 */
export async function fetchCurrentGScale() {
  try {
    // Check cache first
    const cached = getCachedForecast();
    if (cached) {
      console.log('Using cached NOAA forecast data');
      return cached;
    }

    // Fetch fresh data from NOAA
    console.log('Fetching current geomagnetic forecast from NOAA SWPC...');
    const response = await fetch(NOAA_FORECAST_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const textData = await response.text();
    const parsed = parseNOAAForecast(textData);

    if (!parsed) {
      throw new Error('Failed to parse NOAA forecast data');
    }

    // Cache the result
    cacheForecast(parsed);

    console.log(`Current geomagnetic conditions: G${parsed.gScale} (${parsed.gScaleName}), Kp=${parsed.kp}`);
    return parsed;

  } catch (error) {
    console.error('Error fetching NOAA forecast:', error);

    // Try to use cached data even if expired
    const staleCache = localStorage.getItem(CACHE_KEY);
    if (staleCache) {
      console.warn('Using stale cached data due to fetch error');
      const parsed = JSON.parse(staleCache);
      parsed.isStale = true;
      return parsed;
    }

    throw error;
  }
}

/**
 * Get cached forecast data if available and not expired
 *
 * @returns {object|null} Cached forecast data or null
 */
function getCachedForecast() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const age = Date.now() - new Date(data.fetchedAt).getTime();

    if (age < CACHE_DURATION_MS) {
      return data;
    }

    // Cache expired
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

/**
 * Cache forecast data in localStorage
 *
 * @param {object} data - Forecast data to cache
 */
function cacheForecast(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching forecast:', error);
  }
}

/**
 * Clear cached forecast data
 */
export function clearForecastCache() {
  localStorage.removeItem(CACHE_KEY);
}
