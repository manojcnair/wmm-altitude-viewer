# Sample Data for Testing

## Quick Test Without MATLAB

If you want to test the UI before exporting your real MATLAB data, you can generate sample data:

```bash
node generate_sample_data.js
```

This creates realistic sample data files (G0.json through G4.json) with:
- Proper grid structure: 18 lats × 36 lons × 29 altitudes
- Realistic error patterns that increase with altitude
- Spatial variations (latitude, longitude effects)
- G-scale scaling (higher errors for stronger storms)
- NaN values for declination near poles (realistic)

## What the Sample Data Includes

### Realistic Patterns

1. **Altitude Scaling**: Errors grow logarithmically with altitude (as expected physically)
2. **Latitude Effects**: Higher errors at magnetic poles for D and I components
3. **Longitude Variations**: Simulates crustal anomalies and regional variations
4. **G-Scale Scaling**: Each storm level (G0-G4) increases errors by ~40%
5. **Component-Specific Values**: Realistic base errors for each field component

### Sample Error Values (Ground Level, G0)

- **F (Total Field)**: ~50 nT
- **H (Horizontal)**: ~40 nT
- **X (North)**: ~35 nT
- **Y (East)**: ~30 nT
- **Z (Down)**: ~45 nT
- **D (Declination)**: ~0.2°
- **I (Inclination)**: ~0.15°

At 10,000 km altitude, these values increase by approximately 2-3×.

## File Sizes

Each generated JSON file is approximately **2 MB**, totaling about **10 MB** for all 5 G-scales.

Your real MATLAB data may be larger or smaller depending on the precision used.

## Replacing with Real Data

When you're ready with real MATLAB data:

1. Run the MATLAB export script:
   ```matlab
   export_wmm_for_web
   ```

2. Replace the sample files:
   ```bash
   rm public/data/G*.json
   cp wmm_web_data/*.json public/data/
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

## Sample Data Characteristics

### Grid Structure
```javascript
{
  "F": [
    [  // Latitude 0 (-85°)
      [  // Longitude 0 (5°)
        50.1,    // Altitude 0 (0 km)
        52.3,    // Altitude 1 (10 km)
        ...
        143.2    // Altitude 28 (10,000 km)
      ],
      ...  // 36 longitudes
    ],
    ...  // 18 latitudes
  ]
}
```

### Profile Structure
```javascript
{
  "profile_F": [
    50.5,     // Altitude 0 (0 km)
    52.7,     // Altitude 1 (10 km)
    ...
    148.3     // Altitude 28 (10,000 km)
  ]
}
```

## Validation

The sample data is designed to:
- ✅ Load successfully in the app
- ✅ Display on the map with smooth color gradients
- ✅ Show realistic altitude profiles on charts
- ✅ Demonstrate threshold crossings at higher altitudes
- ✅ Handle special cases (NaN for D near poles)

## Differences from Real Data

Sample data is **synthetic** and uses simplified mathematical models. Real MATLAB data will have:
- More complex spatial patterns (magnetic anomalies)
- Real physics-based altitude scaling
- Actual storm-time variations
- Commission error from spherical harmonic truncation
- Real measurement-based statistics

**Use sample data for UI testing only. Use real MATLAB data for scientific analysis.**

## Customizing Sample Data

To modify the sample data generation, edit [generate_sample_data.js](generate_sample_data.js):

- **Line 60-70**: Adjust altitude scaling factors
- **Line 74-82**: Modify component-specific base errors
- **Line 86**: Change spatial variation patterns
- **Line 89**: Adjust G-scale impact factors

Then regenerate:
```bash
node generate_sample_data.js
```

## Troubleshooting

### "Not valid JSON" error
- Delete existing files: `rm public/data/G*.json`
- Regenerate: `node generate_sample_data.js`
- Restart dev server

### Data looks unrealistic
- This is expected - it's synthetic data for UI testing
- Export your real MATLAB data for accurate visualization

### Different file sizes than expected
- Sample data uses 2 decimal precision
- Real data precision depends on MATLAB export settings
- Both will work fine in the app
