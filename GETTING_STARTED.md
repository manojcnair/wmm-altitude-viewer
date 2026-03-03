# Getting Started with WMM Altitude Error Viewer

## What You Have

A complete, production-ready web application for visualizing World Magnetic Model errors. See [README.md](README.md) for the full project structure.

## Quick Start Options

### Option A: Test with Sample Data (Fastest)

The app can generate synthetic data for UI testing:

```bash
cd wmm_altitude_web_app
node generate_sample_data.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring.

**Note**: Sample data is synthetic and for UI testing only. See [SAMPLE_DATA.md](SAMPLE_DATA.md) for details.

### Option B: Use Your Real MATLAB Data

#### Step 1: Export Your MATLAB Data

```bash
# In your MATLAB data directory
matlab -batch "run('export_wmm_for_web.m')"
```

This creates `wmm_web_data/G0.json` through `G5.json`.

#### Step 2: Replace Sample Data with Real Data

```bash
rm wmm_altitude_web_app/public/data/G*.json
cp wmm_web_data/*.json wmm_altitude_web_app/public/data/
```

#### Step 3: Restart the App

```bash
npm run dev
```

Your real data will now be displayed.

## What You'll See

### Left Sidebar
- **G-Scale Buttons**: Switch between G0 (quiet) to G5 (extreme storm)
- **Component Dropdown**: Select F, H, D, I, X, Y, Z field components
- **Altitude Slider**: Explore 0-10,000 km range (in Model Errors view)
- **Threshold Toggle**: Compare MilSpec vs Error Model standards

### Main View
- **Global Map**: Mollweide projection heatmap with jet colormap showing spatial error distribution
- **Coastlines**: Overlaid for geographic context
- **Hover Tooltip**: Shows lat, lon (±180°), and error/altitude value

### Bottom Chart
- **Altitude Profile**: Log-scale plot of global average errors
- **Threshold Line**: Visual reference for acceptable limits
- **Interactive Tooltips**: Hover for exact values

## Example Use Cases

### 1. Low Earth Orbit Analysis (400 km)
```
Settings: G-scale = 2, Component = F, Altitude = 400 km
Question: What are total field errors at ISS altitude during moderate storms?
```

### 2. High-Altitude Comparison
```
Settings: Component = H, Threshold = MilSpec
Action: Slide altitude from 100 km → 1000 km → 10,000 km
Observe: How errors scale with altitude
```

### 3. Storm Impact Assessment
```
Settings: Altitude = 600 km, Component = D
Action: Click G0 → G1 → G2 → G3 → G4 → G5
Compare: Declination errors under different space weather conditions
```

### 4. Component Comparison
```
Settings: G-scale = 3, Altitude = 800 km
Action: Cycle through F, H, X, Y, Z components
Identify: Which components exceed thresholds
```

## Understanding the Data

### Field Components
- **F (Total Field)**: Overall magnetic field strength — most stable
- **H (Horizontal)**: Ground-level navigation accuracy
- **D (Declination)**: Compass heading errors — critical for aviation
- **I (Inclination)**: Dip angle — important for drilling/surveying
- **X (North)**: Northward component
- **Y (East)**: Eastward component
- **Z (Down)**: Vertical component — largest magnitude at poles

### Thresholds
- **MilSpec**: Military performance specification (MIL-PRF-89500B) — maximum allowable errors for operational use. These are the more lenient thresholds that WMM must meet throughout its 5-year lifespan.
- **Error Model**: WMM theoretical error model — a stricter, realistic estimate of expected accuracy based on known error sources including crustal anomalies and external field disturbances.

### G-Scales (Geomagnetic Activity)
- **G0**: Normal space weather (Kp < 5)
- **G1**: Minor storm (Kp = 5)
- **G2**: Moderate storm (Kp = 6)
- **G3**: Strong storm (Kp = 7)
- **G4**: Severe storm (Kp = 8-9)
- **G5**: Extreme storm (Kp = 9)

### Normalized Errors (Altitude Limits View)
For intensity components (F, H, X, Y, Z), the altitude profile chart shows errors normalized by the WMM field strength (as a percentage). This accounts for the fact that the magnetic field weakens with altitude, making a fixed nT threshold progressively harder to meet. Angular components (D, I) are shown in absolute degrees since they do not decay with altitude.

## Customization

### Change Color Scale
Edit `src/constants.js` — the `jetColormap()` and `jetColormapReversed()` functions control the MATLAB-style jet colormap.

### Adjust Thresholds
Edit `src/constants.js`:
```javascript
export const THRESHOLDS = {
  MilSpec: { F: 280, H: 200, ... },
  Custom: { F: 150, H: 100, ... }  // Add your own
};
```

## Troubleshooting

### App shows "Data Not Found"
Run the MATLAB export script and copy JSON files to `public/data/`

### Map is blank/black
Check browser console (F12) for JavaScript errors. Verify `public/data/countries-110m.json` exists.

### Charts not showing
Ensure profile data exists in JSON (profile_F, profile_H, etc.)

### Build fails
Delete `node_modules` and run `npm install` again

## Ready to Deploy?

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel, Netlify, or other hosting options.

## Pre-Flight Checklist

Before sharing:

- [ ] MATLAB data exported (6 JSON files: G0-G5)
- [ ] Data copied to `public/data/`
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts successfully
- [ ] Map renders with heatmap overlay
- [ ] Charts show altitude profiles
- [ ] All G-scales (0-5) load correctly
- [ ] All components (F-Z) display data
- [ ] Both view modes (Altitude Limits, Model Errors) work
- [ ] Threshold toggle works
- [ ] Production build succeeds: `npm run build`
