# WMM Altitude Error Viewer

Interactive web application to visualize World Magnetic Model (WMM) errors across altitude and geomagnetic activity levels. Deployed at [geomag.info](https://geomag.info).

Based on: Nair et al. (2025), "Global Geomagnetic Model Errors as a Function of Altitude and Geomagnetic Activity," *Space Weather*.

## Features

- **Interactive Global Map**: Mollweide projection heatmap showing spatial error distributions
- **Altitude Limit Maps**: Maximum valid altitude per location for each threshold standard
- **Altitude Profiles**: Global average errors as a function of altitude (log scale)
- **Multiple Field Components**: F, H, D, I, X, Y, Z magnetic field components
- **Geomagnetic Activity Levels**: G0 (quiet) through G5 (extreme storm) conditions
- **Dual Threshold Standards**: MilSpec operational thresholds and WMM Error Model thresholds
- **Live Conditions**: Auto-detects current G-scale from NOAA Space Weather Prediction Center

## Quick Start

### Option A: Test with Sample Data (Fastest)

Generate sample data to test the UI immediately:

```bash
cd wmm_altitude_web_app
node generate_sample_data.js
npm run dev
```

See [SAMPLE_DATA.md](SAMPLE_DATA.md) for details about the sample data.

### Option B: Use Real MATLAB Data

#### 1. Export Data from MATLAB

The app requires data exported from your MATLAB analysis:

```bash
cd /path/to/matlab/data
matlab -batch "run('export_wmm_for_web.m')"
```

This will create a `wmm_web_data` folder with G0.json through G5.json files.

#### 2. Copy Data to App

```bash
cp -r wmm_web_data /path/to/wmm_altitude_web_app/public/data
```

#### 3. Install Dependencies

```bash
cd wmm_altitude_web_app
npm install
```

#### 4. Run Development Server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Data Format

Each G-scale JSON file contains:

```json
{
  "gScale": 0,
  "lats": [-85, -75, ..., 85],
  "lons": [5, 15, ..., 355],
  "altitudes": [0, 10, 20, ..., 10000],
  "F": [[[...]]],
  "H": [[[...]]],
  "D": [[[...]]],
  "I": [[[...]]],
  "X": [[[...]]],
  "Y": [[[...]]],
  "Z": [[[...]]],
  "profile_F": [...],
  "profile_H": [...],
  "profile_D": [...],
  "profile_I": [...],
  "profile_X": [...],
  "profile_Y": [...],
  "profile_Z": [...],
  "F_alt_limit_milspec": [[...]],
  "F_alt_limit_wmm": [[...]],
  "wmm_F_average": [...]
}
```

## Project Structure

```
wmm_altitude_web_app/
├── public/
│   └── data/                    # JSON data files (G0.json - G5.json)
│       └── countries-110m.json  # Coastline data (TopoJSON)
├── src/
│   ├── components/
│   │   ├── Controls.jsx              # Sidebar controls and help popup
│   │   ├── D3MapViewOptimized.jsx    # Canvas+SVG error heatmap (Mollweide)
│   │   ├── D3AltitudeLimitMap.jsx    # Canvas+SVG altitude limit map
│   │   ├── AltitudeChart.jsx         # Recharts altitude profile (log X)
│   │   └── AltitudeNormalizedChart.jsx # Normalized error profile (log-log)
│   ├── hooks/
│   │   └── useCurrentGScale.js  # NOAA live Kp fetch hook
│   ├── utils/
│   │   └── noaaForecast.js      # NOAA SWPC API integration
│   ├── constants.js             # Components, thresholds, colormaps
│   ├── App.jsx                  # Main app with state management
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind styles
├── export_wmm_for_web.m         # MATLAB export script
├── generate_sample_data.js      # Synthetic test data generator
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Controls

### Geomagnetic Activity Level
- **G0**: Quiet conditions
- **G1**: Minor geomagnetic storm
- **G2**: Moderate storm
- **G3**: Strong storm
- **G4**: Severe storm
- **G5**: Extreme storm

### Field Components
- **F**: Total field intensity (nT)
- **H**: Horizontal component (nT)
- **D**: Declination angle (degrees from true north)
- **I**: Inclination angle (degrees from horizontal)
- **X**: North component (nT)
- **Y**: East component (nT)
- **Z**: Vertical component, positive down (nT)

### Threshold Standards
- **MilSpec**: Military performance specification (MIL-PRF-89500B) — maximum allowable errors for operational use throughout the WMM 5-year lifespan
- **Error Model**: WMM theoretical error model — realistic estimate of expected accuracy based on known error sources

## Technology Stack

- **React 18**: UI framework
- **Vite 6**: Build tool and dev server
- **D3 v7**: Mollweide map projections (d3-geo-projection)
- **Recharts 2**: Data visualization charts
- **Tailwind CSS 3**: Styling
- **topojson-client**: Coastline rendering

## Building for Production

```bash
npm run build
```

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Troubleshooting

### "Data Not Found" Error

1. Check that `public/data` folder exists
2. Verify G0.json through G5.json are present
3. Restart dev server after adding data files

### Map Not Rendering

1. Check browser console for JavaScript errors
2. Verify `public/data/countries-110m.json` exists (coastline data)
3. Verify data format matches expected structure

### NaN Values in Declination

Declination (D) can be undefined near magnetic poles. The app handles this by rendering NaN values as gray tiles.

## License

MIT

## Credits

Data processing based on World Magnetic Model (WMM) analysis for space weather applications.
