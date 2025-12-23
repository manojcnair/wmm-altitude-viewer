# Quick Start Guide

## Step-by-Step Setup

### 1. Export Your MATLAB Data

Navigate to your MATLAB data directory and run the export script:

```bash
cd /path/to/your/matlab/data
# Copy the export script
cp /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/export_wmm_for_web.m .
```

Open MATLAB and run:

```matlab
export_wmm_for_web
```

This creates a `wmm_web_data` folder with 5 JSON files (G0-G4).

### 2. Copy Data to Web App

```bash
cp -r wmm_web_data /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/public/data
```

Or manually:
1. Copy all `.json` files from `wmm_web_data/`
2. Paste into `/Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/public/data/`

### 3. Run the App

```bash
cd /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

## What You'll See

1. **Left Sidebar**: Controls for selecting:
   - Geomagnetic activity level (G0-G4)
   - Magnetic field component (F, H, D, I, X, Y, Z)
   - Altitude (0-10,000 km)
   - Threshold standard (MilSpec or WMM)

2. **Main Map**: Global heatmap showing error distribution at selected altitude

3. **Bottom Chart**: Altitude profile showing how errors change with height

## Expected Data Requirements

Your MATLAB `.mat` files should contain:

- `Combined_X_rms`, `Combined_Y_rms`, `Combined_Z_rms`
- `Combined_F_rms`, `Combined_H_rms`
- `Combined_D_rms`, `Combined_I_rms` (in radians)
- `Combined_X_average`, `Combined_Y_average`, etc.

Grid dimensions: `[altitude, longitude, latitude]` = `[29, 36, 18]`

## Troubleshooting

### App shows "Data Not Found"
- Run the MATLAB export script
- Check that JSON files are in `public/data/`
- Restart the dev server: `npm run dev`

### Map is blank
- Check browser console (F12) for errors
- Verify JSON files are valid (not corrupted)
- Try a different G-scale value

### Build errors
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

## Next Steps

See [README.md](README.md) for:
- Detailed feature documentation
- Adding new capabilities (animation, downloads, etc.)
- Deployment instructions
- Technical architecture details
