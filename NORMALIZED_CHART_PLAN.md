# Normalized Error Chart Implementation Plan

## Step 1: Re-export JSON Data (MATLAB)

The export script has been updated to include WMM nominal field data.

### Actions Required:
```matlab
cd /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app
export_wmm_for_web
```

This will add the following fields to each G*.json file:
- `wmm_F_average` (29 values)
- `wmm_H_average` (29 values)
- `wmm_X_average` (29 values)
- `wmm_Y_average` (29 values)
- `wmm_Z_average` (29 values)

### After Export:
```bash
cp -r /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/wmm_web_data/* /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/public/data/
```

## Step 2: Create Normalized Chart Component (React)

### New Component: `AltitudeNormalizedChart.jsx`

**Purpose**: Display normalized error profiles for intensity components (F, H, X, Y, Z) in the Altitude Limits view.

**Key Features**:
1. **Normalization Formula** (from MATLAB code lines 113-119, 148-153):
   ```javascript
   // Normalized error at each altitude
   relativeError = (profile[i] / wmm_average[i]) * 100;  // %

   // Normalized threshold (using ground-level WMM value)
   normalizedThreshold = (threshold_nT / wmm_average[0]) * 100;  // %
   ```

2. **Chart Configuration**:
   - X-axis: Altitude (km), log scale, domain [10, 10000]
   - Y-axis: Relative Error (%), linear scale, auto-range
   - Blue line: Normalized error profile
   - Orange dashed line: Normalized threshold

3. **Component-Specific Behavior**:
   - **Intensity components (F, H, X, Y, Z)**: Use normalization
   - **Angular components (D, I)**: Skip chart (not applicable since angular errors don't normalize this way)

4. **Chart Title**: "Normalized Error Profile vs Altitude"
5. **Subtitle**: "Errors normalized by WMM field strength (%) - accounts for field weakening with altitude"

## Step 3: Update App.jsx

Add the normalized chart below the altitude limit map:

```javascript
{viewMode === 'altitude_limits' && (
  <AltitudeNormalizedChart
    data={data}
    component={component}
    errorModel={errorModel}
  />
)}
```

## Technical Details

### Normalization Logic (Intensity Components Only)

**Why normalize?**
- WMM main field strength decreases with altitude
- Absolute errors may increase, but relative to the weakening field, they might be acceptable
- This gives a fairer comparison across altitudes

**Example for F component**:
```javascript
// At ground (0 km): WMM_F = 50,000 nT
// At 1000 km: WMM_F = 30,000 nT

// If error is 300 nT at both altitudes:
// Ground:  300 / 50,000 * 100 = 0.6%
// 1000 km: 300 / 30,000 * 100 = 1.0%

// Threshold: MilSpec = 280 nT
// Normalized threshold = 280 / 50,000 * 100 = 0.56%
```

### Files to Create/Modify

1. **Created**: `export_wmm_for_web.m` (lines 30-38, 88-96) - Load and export WMM field data
2. **To Create**: `src/components/AltitudeNormalizedChart.jsx` - New chart component
3. **To Modify**: `src/App.jsx` - Add chart to altitude_limits view
4. **To Modify**: `src/constants.js` (if needed) - Add any new constants

## Next Steps

1. ✅ Update `export_wmm_for_web.m` to include WMM nominal fields
2. ⏳ Run MATLAB export script
3. ⏳ Copy JSON files to public/data
4. ⏳ Create `AltitudeNormalizedChart.jsx` component
5. ⏳ Update `App.jsx` to show chart in altitude_limits view
6. ⏳ Test with different components and error models

## Notes

- D and I components don't get normalized (they're already in degrees, not affected by field strength)
- The chart should only appear for F, H, X, Y, Z components
- For D and I, the altitude limit map stands alone without a chart below
