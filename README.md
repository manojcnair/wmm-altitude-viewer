# WMM Altitude Error Viewer

Interactive web application to visualize World Magnetic Model (WMM) errors across altitude and geomagnetic activity levels, inspired by Figures 2-5 in the Space Weather paper.

## Features

- **Interactive Global Map**: Visualize error distributions across latitude, longitude, and altitude
- **Altitude Profiles**: View global average errors as a function of altitude (log scale)
- **Multiple Field Components**: F, H, D, I, X, Y, Z magnetic field components
- **Geomagnetic Activity Levels**: G0 (quiet) through G4 (severe storm) conditions
- **Dual Threshold Standards**: MilSpec operational thresholds and WMM error model thresholds
- **Real-time Updates**: Smooth transitions when changing parameters

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

This will create a `wmm_web_data` folder with G0.json through G4.json files.

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
  "lats": [-85, -75, ..., 85],          // 18 values
  "lons": [5, 15, ..., 355],            // 36 values
  "altitudes": [0, 10, 20, ..., 10000], // 29 values
  "F": [[[...]]],                        // [lat][lon][alt] grid
  "H": [[[...]]],
  "D": [[[...]]],                        // In degrees
  "I": [[[...]]],                        // In degrees
  "X": [[[...]]],
  "Y": [[[...]]],
  "Z": [[[...]]],
  "profile_F": [...],                    // Global average vs altitude
  "profile_H": [...],
  "profile_D": [...],
  "profile_I": [...],
  "profile_X": [...],
  "profile_Y": [...],
  "profile_Z": [...]
}
```

## Project Structure

```
wmm_altitude_web_app/
├── public/
│   └── data/              # JSON data files (G0.json - G4.json)
├── src/
│   ├── components/
│   │   ├── Controls.jsx   # Sidebar controls
│   │   ├── MapView.jsx    # Leaflet map with canvas overlay
│   │   └── AltitudeChart.jsx  # Recharts altitude profile
│   ├── constants.js       # Field components, thresholds, colors
│   ├── App.jsx            # Main app with state management
│   ├── main.jsx           # React entry point
│   └── index.css          # Tailwind styles
├── export_wmm_for_web.m   # MATLAB export script
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

### Field Components
- **F**: Total field intensity (nT)
- **H**: Horizontal component (nT)
- **D**: Declination angle (degrees from true north)
- **I**: Inclination angle (degrees from horizontal)
- **X**: North component (nT)
- **Y**: East component (nT)
- **Z**: Vertical component, positive down (nT)

### Threshold Standards
- **MilSpec**: Military specification operational thresholds
- **WMM Error**: WMM error model scientific accuracy thresholds

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Leaflet**: Interactive maps
- **Recharts**: Data visualization
- **Tailwind CSS**: Styling

## Building for Production

```bash
npm run build
```

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

## Development Tips

### Adding New Features

**Animation Controls**: Add a play/pause button to animate through altitudes:

```jsx
const [playing, setPlaying] = useState(false);

useEffect(() => {
  if (!playing) return;
  const timer = setInterval(() => {
    setAltIdx(i => (i + 1) % ALTITUDES.length);
  }, 500);
  return () => clearInterval(timer);
}, [playing]);
```

**Download Current View**: Export map as PNG:

```jsx
import html2canvas from 'html2canvas';

const downloadView = () => {
  html2canvas(document.querySelector('.map-container')).then(canvas => {
    const link = document.createElement('a');
    link.download = `wmm-G${gScale}-${component}-${ALTITUDES[altIdx]}km.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
};
```

### Performance Optimization

- Data is lazy-loaded per G-scale (only loads when selected)
- Canvas rendering for smooth heatmap (no DOM elements per pixel)
- Recharts efficiently handles 29-point altitude profiles

## Troubleshooting

### "Data Not Found" Error

1. Check that `public/data` folder exists
2. Verify G0.json through G4.json are present
3. Restart dev server after adding data files

### Map Not Rendering

1. Check browser console for Leaflet errors
2. Ensure Leaflet CSS is imported in MapView.jsx
3. Verify data format matches expected structure

### NaN Values in Declination

Declination (D) can be undefined near magnetic poles. The app handles this by rendering NaN values as transparent.

## License

MIT

## Credits

Data processing based on World Magnetic Model (WMM) analysis for space weather applications.
