# What's New in WMM Altitude Viewer

## Major Visual Improvements

Your WMM Altitude Visualization app has been upgraded to match the publication-quality figures from the Space Weather paper!

### 🎨 New Jet Colormap

The app now uses MATLAB's Jet colormap instead of Viridis:

**Before**: Purple → Blue → Green → Yellow (Viridis)
**Now**: Blue → Cyan → Green → Yellow → Red (Jet)

- Matches the colormap used in Figures 2-3 of the paper
- Color scale ranges from 0 to your selected threshold
- Values exceeding threshold appear in **white** for easy identification
- Perfect for identifying regions that exceed operational limits

### 🗺️ Mollweide Projection

The map now uses an equal-area projection:

**Before**: Mercator (distorts polar regions)
**Now**: Mollweide (equal-area, no distortion)

- Accurate representation of geomagnetic features at all latitudes
- Elliptical shape matching the paper's figures
- No polar exaggeration
- Better for global magnetic field visualization

### 📐 Tile-Based Rendering

Each grid cell is now rendered as a proper geographic tile:

**Before**: 36×18 pixel image stretched over the map
**Now**: 648 individual polygons (10° × 10° tiles)

- Smooth, professional appearance
- Proper handling of projection distortion
- Interactive hover tooltips
- Exactly like MATLAB's `pcolorm` function

### 🌍 Coastlines & Geography

The map now includes:
- World coastline outlines (gray)
- Latitude/longitude grid lines (graticule)
- Ocean background
- Clean border around the projection

Makes it much easier to identify geographic regions with high/low errors.

### 📊 Corrected Altitude Chart

The altitude profile chart now has the correct orientation:

- **X-axis**: Error values (matches Figure 4 in the paper)
- **Y-axis**: Altitude on log scale (10-10,000 km)
- **Reference line**: Vertical dashed line at threshold
- Clear labeling and interactive tooltips

### 🎯 Smart Threshold Display

The color scale now adapts to your selected threshold:

**MilSpec mode**: Scale from 0 to MilSpec threshold
**WMM Error mode**: Scale from 0 to WMM threshold

This makes it immediately obvious which regions exceed your chosen standard.

### 🖱️ Interactive Features

New hover tooltips show:
- Latitude
- Longitude
- Error value with units
- Highlighted tile on mouseover

## Quick Tour

### Updated Controls

1. **G-Scale Buttons** (top of sidebar)
   - Switch between G0 (quiet) to G4 (severe storm)
   - Data loads dynamically

2. **Component Selector**
   - Choose from F, H, D, I, X, Y, Z
   - Each has appropriate units (nT or degrees)

3. **Altitude Slider**
   - Explore 0-10,000 km range
   - 29 altitude levels

4. **Threshold Toggle**
   - **MilSpec**: Operational requirements (more lenient)
   - **WMM Error**: Scientific accuracy (stricter)
   - Color scale updates automatically

5. **Color Legend** (bottom of sidebar)
   - Shows Jet colormap gradient
   - Min (0) to Max (threshold)
   - "White = exceeds threshold" indicator

### Map Features

- **Projection**: Mollweide equal-area (oval shape)
- **Grid**: 648 tiles (18 lats × 36 lons)
- **Overlays**: Coastlines and graticule
- **Interactive**: Hover for lat/lon/error details
- **Legend**: Color scale in bottom-right corner

### Chart Features

- **Layout**: Error (horizontal) vs Altitude (vertical)
- **Scale**: Logarithmic altitude axis
- **Threshold**: Vertical dashed line
- **Profile**: Global average error
- **Tooltips**: Hover for exact values

## What Stayed the Same

✅ All your data works exactly as before
✅ Same G-scale files (G0-G4.json)
✅ Same component structure
✅ Same MATLAB export script
✅ Same controls and workflow
✅ Same fast performance

## Technical Improvements

### Smaller Bundle Size
- **Before**: 704 KB
- **After**: 588 KB
- **Savings**: 116 KB (-16%)

### New Technology Stack
- D3.js for geographic projections
- SVG-based rendering
- TopoJSON for coastline data
- Faster initial load

### Better Browser Support
- Works on all modern browsers
- Responsive layout
- Smooth animations
- No dependencies on external tile servers

## How to Use

### Refresh Your Browser

If you have the app open, **refresh the page** to see the new visualization.

### Explore the New Features

1. **Try different components**: Notice how D (declination) shows NaN near the poles in gray
2. **Switch thresholds**: Watch the color scale adjust between MilSpec and WMM
3. **Hover over tiles**: See exact lat/lon coordinates and error values
4. **Change altitudes**: Observe how errors increase with altitude
5. **Compare G-scales**: See how geomagnetic storms amplify errors

### Best Practices

**For presentations**:
- Use MilSpec threshold to show operational impacts
- Focus on mid-altitude range (400-1000 km) for LEO satellites
- Compare G0 vs G3/G4 to show storm effects

**For analysis**:
- Use WMM threshold for scientific accuracy
- Examine altitude profiles to identify error scaling
- Check declination (D) and inclination (I) near poles

**For publications**:
- The visualization now matches paper quality
- Screenshots can be used directly in presentations
- Color scale is publication-standard (Jet colormap)

## Keyboard Shortcuts

None yet, but these could be added:
- Arrow keys to change altitude
- Number keys (0-4) to change G-scale
- C key to cycle through components

## Known Limitations

1. **Polar regions**: Declination (D) can be undefined near magnetic poles (shown as gray)
2. **Zooming**: Map doesn't support zoom/pan yet (coming in future update)
3. **Mobile**: Best viewed on desktop/tablet (responsive, but desktop is optimal)

## Troubleshooting

### Map shows as blank
→ Check browser console (F12) for errors
→ Verify world atlas is loading (network tab)
→ Try refreshing the page

### Colors look wrong
→ Ensure you selected a component (F, H, D, I, X, Y, or Z)
→ Check that threshold is set (MilSpec or WMM)

### Coastlines missing
→ Check internet connection (coastline data loads from CDN)
→ World atlas URL: `https://cdn.jsdelivr.net/npm/world-atlas@2/`

### Tooltips not working
→ Make sure you're hovering over colored tiles, not the ocean
→ SVG must be fully loaded (wait a moment after page load)

## Feedback

Found a bug or have a suggestion? Let us know!

The visualization should now match the quality and style of Figures 2-5 in the Space Weather paper while adding interactive features that make exploration easier.

## Next Steps

Potential future enhancements:
- Animation controls (auto-play through altitudes)
- Download current view as PNG
- Side-by-side G-scale comparison
- Contour lines for iso-error visualization
- Custom color scale selection

Enjoy exploring your WMM altitude error data with the improved visualization! 🚀🌍
