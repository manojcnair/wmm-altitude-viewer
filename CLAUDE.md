# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WMM Altitude Viewer - Interactive web app for visualizing World Magnetic Model (WMM) errors across altitude and geomagnetic activity levels. Deployed at geomag.info.

Based on: Nair et al. (2025), "Global Geomagnetic Model Errors as a Function of Altitude and Geomagnetic Activity," Space Weather.

## Commands

- `npm run dev` - Start Vite dev server on localhost:3000 (auto-opens browser)
- `npm run build` - Production build to `dist/`
- `npm run preview` - Preview production build locally
- `node generate_sample_data.js` - Generate synthetic test data in `public/data/`

No test framework, ESLint, or Prettier is configured.

## Tech Stack

React 18 (JSX, no TypeScript), Vite 6, Tailwind CSS 3, D3 v7 (Mollweide map projections), Recharts 2 (altitude profile charts), topojson-client (coastlines).

## Architecture

### State Management

All state lives in `App.jsx` via `useState` hooks, passed as props to children. No external state library. Key state: `gScale` (0-5), `component` (F/H/D/I/X/Y/Z), `altIdx` (0-28), `threshold` (MilSpec/WMM), `viewMode` (errors/altitude_limits), `data` (loaded JSON).

### Data Pipeline

1. MATLAB (`.mat` files) -> `export_wmm_for_web.m` -> JSON files (`G0.json`-`G5.json`, ~2.5 MB each) in `wmm_web_data/`
2. JSON files placed in `public/data/` and served statically
3. App fetches `/data/G{N}.json` when G-scale changes
4. On mount, `useCurrentGScale` hook fetches live Kp index from NOAA SWPC to auto-select G-scale

### Map Rendering (Hybrid Canvas+SVG)

- **Canvas layer**: colored grid tiles (18 lat x 36 lon = 648 tiles) for performance
- **SVG layer**: coastlines, graticule, sphere outline on top
- **Projection**: Mollweide (equal-area) via `d3-geo-projection`
- **Colormap**: MATLAB-style jet colormap (`jetColormap`/`jetColormapReversed` in `constants.js`)
- **Coastlines**: loaded from CDN (`cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`)

### External APIs

- NOAA observed Kp: `services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
- NOAA 3-day forecast (fallback): `services.swpc.noaa.gov/text/3-day-geomag-forecast.txt`
- Results cached in localStorage for 30 minutes; defaults to G0 if unavailable

### Two View Modes

- **"errors"**: `D3MapViewOptimized.jsx` (error heatmap at specific altitude) + `AltitudeChart.jsx` (error vs altitude, log X axis)
- **"altitude_limits"**: `D3AltitudeLimitMap.jsx` (max valid altitude per location) + `AltitudeNormalizedChart.jsx` (normalized error, log-log)

### Legacy Components (not imported)

`D3MapView.jsx` (pure SVG, superseded by `D3MapViewOptimized.jsx`) and `MapView.jsx` (Leaflet, superseded by D3) are kept in the repo but not used.

### Embed Mode

URL parameter `?embed=true` triggers compact layout for iframe embedding.

## Key Domain Concepts

- **G-scale (G0-G5)**: Geomagnetic activity level (quiet to extreme storm), derived from Kp index
- **Components**: F (total field), H (horizontal), D (declination), I (inclination), X (north), Y (east), Z (down)
- **Thresholds**: MilSpec (military spec) and WMM Error Model (scientific accuracy)

## Data Format

Each `G{N}.json` contains: `lats` (18), `lons` (36), `altitudes` (29, 0-10,000 km non-uniform), 3D error grids `F/H/D/I/X/Y/Z` as `[lat][lon][alt]`, 1D profiles `profile_{comp}`, 2D altitude limit grids `{comp}_alt_limit_milspec`/`{comp}_alt_limit_wmm` as `[lat][lon]`, and WMM nominal fields `wmm_{comp}_average` (1D).

## Deployment

Hosted on Vercel, auto-deploys from `main` branch. Data files (`public/data/G*.json`) are committed to the repo.
