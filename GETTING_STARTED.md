# Getting Started with WMM Altitude Viewer

## 🎯 What You Have

A complete, production-ready web application for visualizing World Magnetic Model errors! Here's what's included:

```
wmm_altitude_web_app/
├── 📜 export_wmm_for_web.m        # MATLAB data export script
├── 📱 src/
│   ├── App.jsx                    # Main application
│   ├── constants.js               # Configuration
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Styles
│   └── components/
│       ├── Controls.jsx           # Sidebar controls
│       ├── MapView.jsx            # Interactive map
│       └── AltitudeChart.jsx      # Altitude profile chart
├── 📚 Documentation
│   ├── README.md                  # Full documentation
│   ├── QUICKSTART.md              # Quick setup guide
│   ├── PROJECT_SUMMARY.md         # Technical overview
│   └── DEPLOYMENT.md              # Deployment options
└── ⚙️  Configuration
    ├── package.json               # Dependencies
    ├── vite.config.js             # Build config
    └── tailwind.config.js         # Styling config
```

## 🚀 Quick Start Options

### Option A: Test with Sample Data (Fastest - Already Done!)

The app is already set up with sample data and ready to run:

```bash
cd /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

**Note**: Sample data is synthetic and for UI testing only. See [SAMPLE_DATA.md](SAMPLE_DATA.md) for details.

### Option B: Use Your Real MATLAB Data

#### Step 1: Export Your MATLAB Data

```bash
# In your MATLAB data directory
matlab -batch "run('export_wmm_for_web.m')"
```

This creates `wmm_web_data/G0.json` through `G4.json`.

#### Step 2: Replace Sample Data with Real Data

```bash
rm /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/public/data/G*.json
cp wmm_web_data/*.json /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/public/data/
```

#### Step 3: Restart the App

```bash
npm run dev
```

Your real data will now be displayed!

## 🎨 What You'll See

### Left Sidebar
- **G-Scale Buttons**: Switch between G0 (quiet) to G4 (severe storm)
- **Component Dropdown**: Select F, H, D, I, X, Y, Z field components
- **Altitude Slider**: Explore 0-10,000 km range
- **Threshold Toggle**: Compare MilSpec vs WMM standards
- **Color Legend**: Viridis scale showing error magnitude

### Main View
- **Global Map**: Interactive heatmap showing spatial error distribution
- **Zoom/Pan**: Explore regional variations
- **Info Overlay**: Current selection summary

### Bottom Chart
- **Altitude Profile**: Log-scale plot of global average errors
- **Threshold Line**: Visual reference for acceptable limits
- **Interactive Tooltips**: Hover for exact values

## 🔍 Example Use Cases

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
Action: Click G0 → G1 → G2 → G3 → G4
Compare: Declination errors under different space weather conditions
```

### 4. Component Comparison
```
Settings: G-scale = 3, Altitude = 800 km
Action: Cycle through F, H, X, Y, Z components
Identify: Which components exceed MilSpec thresholds
```

## 📊 Understanding the Data

### Field Components
- **F (Total Field)**: Overall magnetic field strength - most stable
- **H (Horizontal)**: Ground-level navigation accuracy
- **D (Declination)**: Compass heading errors - critical for aviation
- **I (Inclination)**: Dip angle - important for drilling/surveying
- **X (North)**: Northward component
- **Y (East)**: Eastward component
- **Z (Down)**: Vertical component - largest magnitude at poles

### Thresholds
- **MilSpec**: Military operational requirements (stricter)
- **WMM Error**: Scientific accuracy standards (more lenient)

### G-Scales (Geomagnetic Activity)
- **G0**: Normal space weather (Kp < 5)
- **G1**: Minor storm (Kp = 5)
- **G2**: Moderate storm (Kp = 6)
- **G3**: Strong storm (Kp = 7)
- **G4**: Severe storm (Kp = 8)

## 🛠️ Customization

### Change Color Scale
Edit [src/constants.js:57](src/constants.js#L57):
```javascript
export function valueToColor(value, maxValue) {
  // Modify RGB interpolation here
}
```

### Add Animation
Edit [src/App.jsx](src/App.jsx) to add auto-play through altitudes:
```javascript
const [playing, setPlaying] = useState(false);

useEffect(() => {
  if (!playing) return;
  const timer = setInterval(() => {
    setAltIdx(i => (i + 1) % ALTITUDES.length);
  }, 500);
  return () => clearInterval(timer);
}, [playing]);
```

### Adjust Thresholds
Edit [src/constants.js:21](src/constants.js#L21):
```javascript
export const THRESHOLDS = {
  MilSpec: { F: 280, H: 200, ... },
  Custom: { F: 150, H: 100, ... }  // Add your own
};
```

## 📖 Documentation Guide

- **Start here**: [QUICKSTART.md](QUICKSTART.md) - 5-minute setup
- **Full reference**: [README.md](README.md) - Complete features & API
- **Technical details**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Architecture
- **Go live**: [DEPLOYMENT.md](DEPLOYMENT.md) - Vercel, Netlify, AWS

## 🐛 Troubleshooting

### App shows "Data Not Found"
→ Run the MATLAB export script and copy JSON files to `public/data/`

### Map is blank/black
→ Check browser console (F12) for JavaScript errors
→ Verify data files are valid JSON

### Charts not showing
→ Ensure profile data exists in JSON (profile_F, profile_H, etc.)

### Build fails
→ Delete `node_modules` and run `npm install` again

## 🚢 Ready to Deploy?

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- One-click deployment to Vercel/Netlify
- Handling large data files (>100MB)
- CDN optimization
- Custom domain setup

## 💡 Tips

1. **Performance**: Each G-scale loads only when selected (~10-30 MB)
2. **Mobile**: Works on tablets, but best experience on desktop
3. **Browsers**: Tested on Chrome, Firefox, Safari, Edge
4. **Data updates**: Just replace JSON files and refresh
5. **Sharing**: Deploy and share a link - no installation needed

## 🎓 Learning Resources

- **Leaflet Maps**: https://leafletjs.com/
- **Recharts**: https://recharts.org/
- **React**: https://react.dev/
- **Vite**: https://vite.dev/

## ✅ Pre-Flight Checklist

Before sharing with colleagues:

- [ ] MATLAB data exported (5 JSON files)
- [ ] Data copied to `public/data/`
- [ ] `npm install` completed without errors
- [ ] `npm run dev` starts successfully
- [ ] Map renders with heatmap overlay
- [ ] Charts show altitude profiles
- [ ] All G-scales (0-4) load correctly
- [ ] All components (F-Z) display data
- [ ] Threshold toggle works
- [ ] Production build succeeds: `npm run build`

## 🎉 You're All Set!

Your WMM Altitude Visualization App is ready to explore magnetic field errors across the altitude range from ground level to deep space.

**Happy visualizing!** 🌍🛰️

---

Need help? Check the documentation files or inspect the well-commented source code.
