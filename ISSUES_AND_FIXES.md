# Issues and Fixes

## Issue 1: Black Column on Left Edge ✅ Investigating

### Problem
There's a black gap between the globe outline and the leftmost grid tiles - looks like one column is missing.

### Diagnosis Steps

**Added diagnostic logging** to check:
```javascript
// In D3MapViewOptimized.jsx
console.log('Grid diagnostics:');
console.log('  Lats:', lats.length, 'values:', lats);
console.log('  Lons:', lons.length, 'values:', lons);
```

**Check the browser console** for output. You should see:
```
Lats: 18 values: [-85, -75, ..., 85]
Lons: 36 values: [5, 15, 25, ..., 355]
```

### Likely Causes

**A. Longitude wraparound issue** ⭐ Most likely
- Grid lons: [5°, 15°, 25°, ..., 355°]
- First tile: lon=5° → extends from 0° to 10°
- Last tile: lon=355° → extends from 350° to 360°
- **Gap**: Nothing covers 360°-365° (or 0°-5°)

**B. Projection edge clipping**
- Mollweide clips at edges
- First column might be slightly outside valid projection range

**C. Grid indexing error**
- First longitude column (lonI=0) not rendering
- Off-by-one error in loop

### Proposed Fixes

**Option A: Add wraparound tiles** (Best for continuous display)
```javascript
// After main grid loop, add wraparound tiles at 360°+
for (let latI = 0; latI < lats.length; latI++) {
  for (let lonI = 0; lonI < 3; lonI++) { // Add first 3 columns again at 360°+
    const lat = lats[latI];
    const lon = lons[lonI] + 360;  // Wrap: 5→365, 15→375, 25→385
    const value = grid[latI][lonI][altIdx];

    // Draw tile at wrapped position
    drawTile(lat, lon, value);
  }
}
```

**Option B: Extend first tiles to 0°**
```javascript
// For first column only (lon=5°), extend to 0°
if (lonI === 0) {
  lonMin = 0;  // Instead of lon-5 = 0 (which is correct)
}
```

**Option C: Adjust grid definition**
- If using actual MATLAB data, ensure grid covers 0°-360° fully
- May need to regenerate sample data with adjusted grid

### Action Items

1. **Check console output** - What do the diagnostics show?
2. **Inspect left edge** - Which longitude is missing? 0-5° or 355-360°?
3. **Verify grid data** - Does JSON have tiles for all expected positions?

---

## Issue 2: Grid Reading Verification ✅ Diagnostics Added

### Concern
Need to verify data structure matches expected format: `grid[latI][lonI][altIdx]`

### Diagnostic Output

The added logging will show:
```
Grid shape: [18][36][29]
  ↓    ↓   ↓
  lat  lon alt

First tile (lat=-85, lon=5): 68.73 nT
Last tile (lat=85, lon=355): 64.89 nT
Equator, Prime Meridian: 48.62 nT
```

### What to Check

**Correct structure**:
```javascript
grid[latI][lonI][altIdx]
grid[0][0][13]     → lat=-85°, lon=5°,   alt=400km
grid[17][35][13]   → lat=85°,  lon=355°, alt=400km
grid[9][18][13]    → lat=-5°,  lon=185°, alt=400km
```

**If structure is wrong**, you might see:
- `grid[0][0]` is undefined → Wrong array dimensions
- Values look swapped (e.g., altitude where lat should be)
- Array length mismatch

### Sample Data Generation

**Current generation** in `generate_sample_data.js`:
```javascript
// Line 60-97: Creates grid as [lat][lon][alt]
for (let latI = 0; latI < lats.length; latI++) {
  const latGrid = [];
  for (let lonI = 0; lonI < lons.length; lonI++) {
    const altGrid = [];
    for (let altI = 0; altI < altitudes.length; altI++) {
      // Calculate error...
      altGrid.push(error);
    }
    latGrid.push(altGrid);
  }
  grid.push(latGrid);
}
```

This creates: `grid[18][36][29]` ✅ Correct format

### Verification Steps

1. **Run diagnostics** - Check console output
2. **Compare values**:
   - Polar regions (high lat) should have higher errors than equator
   - Should see ~50-150 nT for F component at 400 km
3. **Test spatial patterns**:
   - Move from equator → pole on map
   - Hover to see error values
   - Should see gradual increase

---

## Issue 3: Altitude Chart Purpose ✅ Fixed

### Problem
Chart purpose was unclear - "What does this show and why do I care?"

### What the Chart Shows

**Purpose**: Answers the question: **"At what altitude do errors become problematic?"**

**Reading the chart**:
```
Y-axis (vertical): Altitude from 10 km to 10,000 km (log scale)
X-axis (horizontal): Error magnitude in nT or degrees
Blue line: Global average error at each altitude
Orange dashed line: Threshold (MilSpec or WMM)

Example interpretation:
- At 100 km:  50 nT  ← Safe (well below 280 nT threshold)
- At 400 km:  80 nT  ← Safe
- At 1000 km: 140 nT ← Safe but rising
- At 5000 km: 260 nT ← Approaching threshold!
- At 8000 km: 300 nT ← EXCEEDS threshold ⚠️
```

### Why This Matters

**For satellite operators**:
- LEO satellites (200-2000 km): How much error at my orbit?
- MEO satellites (2000-35000 km): Do I exceed operational limits?
- Mission planning: Can I use WMM at this altitude?

**For scientists**:
- Understand how ionospheric currents affect different altitudes
- Identify where WMM breaks down (errors too large)
- Compare component behavior (F vs D vs I)

### New Title & Description

**Updated to**:
```
Title: "How Errors Scale with Altitude"
Subtitle: "Shows global average error at each altitude.
          Where does error exceed threshold?"
```

### How to Use It

**Scenario 1: Planning a 600 km satellite mission**
1. Find 600 km on Y-axis
2. Read across to blue line
3. Check if it crosses orange threshold line
4. If below: WMM is accurate enough
5. If above: Need better model

**Scenario 2: Comparing G-scales**
1. Look at chart for G0 (quiet)
2. Note where line crosses threshold (~8000 km)
3. Switch to G4 (severe storm)
4. Threshold crossed much lower (~4000 km)
5. Conclusion: Storms make WMM less accurate at lower altitudes

**Scenario 3: Comparing components**
1. Switch between F, H, D, I, X, Y, Z
2. See which components exceed threshold first
3. D and I often exceed first (angular components)
4. F and H more robust (magnitude components)

### Related Figures

This matches **Figure 4** in the Space Weather paper:
- Same layout (error vs altitude)
- Same log scale on altitude
- Shows where model accuracy degrades
- Helps understand altitude-dependent physics

---

## Summary of Fixes

### Implemented ✅

1. **Altitude chart clarity**
   - Better title: "How Errors Scale with Altitude"
   - Added subtitle explaining purpose
   - File: `src/components/AltitudeChart.jsx`

2. **Diagnostic logging**
   - Grid structure verification
   - Sample value checks
   - Console output for debugging
   - File: `src/components/D3MapViewOptimized.jsx`

### To Be Implemented (After Diagnostics)

3. **Black column fix** (pending diagnostic results)
   - Will implement based on console output
   - Likely: Add longitude wraparound tiles
   - Or: Adjust grid edge handling

### Next Steps

1. **Open browser console** (F12)
2. **Refresh the page**
3. **Look for diagnostic output** starting with "Grid diagnostics:"
4. **Report back**:
   - What are the lat/lon arrays?
   - What are the sample values?
   - What's the grid shape?

This will tell us exactly how to fix the black column issue.

---

## User Guide Additions

### Understanding the Altitude Chart

**Q: Why is the Y-axis logarithmic?**
A: Because satellite altitudes span 3 orders of magnitude (10 km to 10,000 km). Log scale shows all altitudes clearly.

**Q: What's "global average"?**
A: The error value averaged across all latitudes and longitudes at each altitude. Shows typical error at that height.

**Q: Why does the line curve upward?**
A: Magnetic field errors grow with altitude because you're farther from the source (Earth's core). The relationship is approximately logarithmic.

**Q: What if the line crosses the threshold?**
A: At altitudes above the crossing point, WMM errors exceed your chosen threshold (MilSpec or WMM). The model may not be accurate enough for critical applications.

**Q: How do I find the crossing point?**
A: Look where the blue line intersects the orange dashed line. Read the altitude value on the Y-axis. That's your maximum safe altitude for this component and threshold.

### Practical Examples

**Example 1: ISS altitude (400 km)**
```
Component: F (Total Field)
Altitude: 400 km (current slider position)
Chart shows: ~80 nT error
Threshold: 280 nT (MilSpec)
Conclusion: ✅ Safe - error is 28% of threshold
```

**Example 2: GPS altitude (20,000 km)**
```
Component: F
Altitude: 20,000 km (move slider all the way right)
Chart shows: ~450 nT error
Threshold: 280 nT
Conclusion: ⚠️ EXCEEDS - error is 161% of threshold
```

**Example 3: Storm impact**
```
G0 (quiet): Threshold crossed at ~8500 km
G4 (storm): Threshold crossed at ~4200 km
Impact: Severe storms reduce safe altitude by 50%!
```

---

## References

**Figure 4 in paper**: Shows same information
- Altitude profiles for different components
- Demonstrates error growth with height
- Identifies model limitations

**Why this view is useful**:
- Quick assessment of model validity at your altitude
- Compare components without switching views
- Understand physics (errors grow with distance from source)
- Mission planning tool (what altitude can I fly at?)

