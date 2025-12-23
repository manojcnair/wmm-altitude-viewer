# NOAA G-Scale Integration

## Overview

This application now integrates real-time geomagnetic activity data from NOAA Space Weather Prediction Center (SWPC) to automatically select the current G-scale level when the app launches.

## Implementation Summary

### Phase 1: CORS Test & Parser ✅

**Created Files:**
1. `src/utils/noaaForecast.js` - NOAA forecast fetcher and parser
2. `src/hooks/useCurrentGScale.js` - React hook for current G-scale state

**Key Features:**
- Fetches from: `https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt`
- Parses Kp index and converts to G-scale (0-5)
- Implements 3-hour localStorage caching
- Handles CORS, network errors, and stale data gracefully

### Phase 2: Kp to G-Scale Conversion

**Mapping:**
```javascript
Kp >= 9  → G5 (Extreme Storm)
Kp >= 8  → G4 (Severe Storm)
Kp >= 7  → G3 (Strong Storm)
Kp >= 6  → G2 (Moderate Storm)
Kp >= 5  → G1 (Minor Storm)
Kp < 5   → G0 (Quiet)  ← Custom level for this app
```

### Phase 3: UI Integration ✅

**Modified Files:**
1. `src/App.jsx` - Integrated `useCurrentGScale` hook, auto-select G-scale on mount
2. `src/components/Controls.jsx` - Added current G-scale indicator and NOAA info link
3. `src/constants.js` - Added G5 label

**UI Features:**
- **Green pulsing dot** on current G-scale button (top-right corner)
- **Info section** below G-scale selector showing:
  - Current G-scale and Kp value
  - Link to NOAA G-scale explanation page
- **Auto-selection**: App defaults to current G-scale on launch
- **Manual override**: User can still select any G-scale manually

### Phase 4: Error Handling & Caching

**Caching Strategy:**
- Cache duration: 3 hours (NOAA updates every 3 hours)
- Storage: localStorage with timestamp
- Automatic expiration and refresh

**Error Handling:**
- **CORS blocked**: Falls back to G0, shows "Live forecast unavailable"
- **Network error**: Uses stale cache if available, otherwise defaults to G0
- **Parse error**: Logs to console, defaults to G0
- **No impact on app functionality**: App works normally even if NOAA fetch fails

## User Experience

### On App Launch:
1. App fetches current geomagnetic forecast from NOAA
2. Converts Kp index to G-scale (0-5)
3. Auto-selects corresponding G-scale
4. Displays green pulsing indicator on current G-scale button
5. Shows "Current: G{X} (Kp={Y})" below G-scale selector

### Visual Indicators:
```
Geomagnetic Activity Level
┌────────────────────────────────────┐
│  [G0]  [G1●] [G2]  [G3]  [G4]  [G5] │  ← Green dot on G1
│                                     │
│  G1 (Minor Storm)                   │  ← Selected G-scale description
└────────────────────────────────────┘

ℹ️ Current: G1 (Kp=5.2)                ← Live conditions
   About NOAA G-scales ↗               ← External link
```

### Link to NOAA:
- Text: "About NOAA G-scales"
- URL: `https://www.swpc.noaa.gov/noaa-scales-explanation#GeomagneticStorms`
- Opens in new tab
- External link icon (↗)

## Technical Details

### Data Source
- **URL**: https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt
- **Format**: Plain text with structured sections
- **Update frequency**: Every 3 hours
- **Parsing**: Extracts first Kp value from 00-03UT forecast row

### Example NOAA Data Format:
```
Product: Geomagnetic Forecast
Issued: 2025 Dec 23 1030 UTC

NOAA Kp index forecast 23 Dec - 25 Dec
            23 Dec      24 Dec      25 Dec
00-03UT        4.67        3.67        2.67
03-06UT        4.33        3.33        2.33
...
```

### Parser Logic:
1. Extract issue timestamp using regex
2. Find "NOAA Kp index forecast" section
3. Extract first Kp value (00-03UT, first column)
4. Convert to G-scale using `kpToGScale()`
5. Return object with: `{ gScale, kp, gScaleName, description, timestamp }`

### Caching Implementation:
```javascript
// Cache key
const CACHE_KEY = 'noaa_geomag_forecast';

// Cache duration (3 hours)
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000;

// Check cache age
const age = Date.now() - new Date(data.fetchedAt).getTime();
if (age < CACHE_DURATION_MS) {
  return cachedData;
}
```

## Testing

### Test CORS in Browser Console:
```javascript
fetch('https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

### Expected Behavior:
1. **First load**: Fetches from NOAA, displays current G-scale
2. **Within 3 hours**: Uses cached data
3. **After 3 hours**: Refreshes from NOAA
4. **Network offline**: Uses stale cache or defaults to G0
5. **CORS blocked**: Defaults to G0, app remains functional

### Browser DevTools Check:
- Open Application tab → Local Storage
- Look for key: `noaa_geomag_forecast`
- Value contains: `{ gScale, kp, fetchedAt, ... }`

## Files Modified/Created

### Created:
- ✅ `src/utils/noaaForecast.js` (189 lines)
- ✅ `src/hooks/useCurrentGScale.js` (62 lines)

### Modified:
- ✅ `src/App.jsx` - Added hook, auto-select logic, passed props to Controls
- ✅ `src/components/Controls.jsx` - Added green dot indicator, info section, NOAA link
- ✅ `src/constants.js` - Added G5 label

## Future Enhancements (Optional)

1. **Refresh button**: Allow manual forecast refresh
2. **Last updated timestamp**: Show "Updated 2h ago"
3. **Stale data warning**: "⚠️ Forecast data may be outdated (>6h old)"
4. **Forecast visualization**: Show 3-day Kp forecast graph
5. **Historical data**: Track G-scale changes over time
6. **Notifications**: Alert user when G-scale changes significantly

## References

- [NOAA G-Scale Explanation](https://www.swpc.noaa.gov/noaa-scales-explanation#GeomagneticStorms)
- [NOAA 3-Day Forecast](https://www.swpc.noaa.gov/products/3-day-geomagnetic-forecast)
- [NOAA Forecast Text File](https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt)

## Notes

- **G0 (Quiet)** is a custom level not defined by NOAA (NOAA scale starts at G1)
- The app gracefully degrades if NOAA data is unavailable
- User can always manually override the auto-selected G-scale
- Caching reduces unnecessary API calls and improves performance
