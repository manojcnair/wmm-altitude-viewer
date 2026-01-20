# WMM Altitude Error Visualizer
## Development Journey: From MATLAB to Interactive Web App

---

## Slide 1: Project Genesis - From MATLAB to Web

### The Challenge
- **Starting Point**: MATLAB scripts for WMM (World Magnetic Model) altitude error analysis
- **Goal**: Transform static MATLAB analysis into an interactive web-based visualization tool
- **Key Requirements**:
  - Preserve scientific accuracy from original MATLAB calculations
  - Enable interactive exploration of error profiles across different components (F, H, X, Y, Z, D, I)
  - Support multiple error models (MilSpec, WMM Error Model)
  - Visualize geomagnetic activity levels (G0-G5, Kp indices)

### Data Pipeline
1. **MATLAB Processing**: Computed global average errors at 29 altitude levels (0-10,000 km)
2. **JSON Export**: Converted MATLAB `.mat` files to JSON format for web consumption
3. **Data Structure**: `G0_data_with_commission.json`, `G1_data...`, through `G5_data...`, plus `WMM_data.json`

---

## Slide 2: Technology Stack & Architecture

### Web Technologies Used

**Frontend Framework**
- **React** (Vite build tool): Fast, component-based UI development
- **Tailwind CSS**: Utility-first styling for responsive design

**Visualization Libraries**
- **Recharts**: Chart components for altitude error profiles
- **D3.js**: Custom geospatial visualizations using Mollweide projection
- **GeoJSON**: World map rendering with error overlays

**Key Features**
- 100% **client-side application** - no backend server required
- Interactive controls: component selection, G-level/Kp selection, error model switching
- Real-time altitude limit calculation with linear interpolation
- Dual view modes: Global error maps + Altitude profile charts

**Deployment**
- **GitHub**: Version control and source hosting
- **Vercel**: Automatic deployment from main branch
- **Production URL**: Live at Vercel subdomain

---

## Slide 3: Development Process - AI-Powered Workflow

### Built Entirely with Claude Code

**What is Claude Code?**
- AI-powered development assistant by Anthropic
- Autonomous coding agent with full development capabilities
- Direct integration with VS Code, Git, and terminal

**Development Highlights**
✅ **Initial Setup**: Project scaffolding with Vite + React + Tailwind
✅ **Data Integration**: JSON parsing and state management for 6 G-level datasets
✅ **Complex Visualizations**: D3 map projections, Recharts configuration, logarithmic scales
✅ **Algorithm Implementation**: Altitude limit calculation matching MATLAB logic
✅ **Iterative Refinement**: Multiple rounds of UI/UX improvements based on feedback
✅ **Git Workflow**: Automated commits with descriptive messages, branch management
✅ **Deployment**: Vercel integration and production deployment

**Key Accomplishments**
- **Interpolation accuracy**: Linear interpolation for exact threshold crossing (rounded to nearest 100 km)
- **Edge case handling**: "Exceeds at all altitudes" and "Valid for all altitudes" detection
- **Performance**: Optimized rendering for large geospatial datasets
- **No security vulnerabilities**: Client-side only, no sensitive data exposure

---

## Slide 4: Results & Impact

### From Static Analysis to Interactive Tool

**MATLAB (Before)**
- Static plots requiring script modifications for different parameters
- Output: PNG images and text tables
- Limited interactivity
- Requires MATLAB license

**Web App (After)**
- **Interactive exploration**: Click to change components, G-levels, error models
- **Real-time updates**: Instant visualization of altitude limits and global error patterns
- **Accessible**: Works in any web browser, no software installation
- **Shareable**: Vercel deployment URL for global access
- **Validated**: Calculations match MATLAB outputs (verified against original scripts)

### Technical Achievements
- **Altitude limit accuracy**: Interpolated crossing detection rounded to nearest 100 km
- **3 Special cases handled**: Normal crossing, exceeds at all altitudes, valid for all altitudes
- **Help documentation**: Built-in guide explaining WMM, geomagnetic indices, and usage
- **Responsive design**: Works on desktop and mobile devices

### Development Stats
- **Lines of Code**: ~2,500+ (React components, utilities, styling)
- **Development Time**: Rapid iteration with Claude Code
- **Git Commits**: 50+ commits with detailed messages
- **Zero manual coding**: Entirely built through AI assistance

---

## Appendix: Key Files & Resources

**Data Files** (JSON format)
- `G0_data_with_commission.json` through `G5_data_with_commission.json`
- `WMM_data.json` (reference model data)

**Core Components**
- `D3MapViewOptimized.jsx`: Global error map with Mollweide projection
- `D3AltitudeLimitMap.jsx`: Altitude limit visualization by location
- `AltitudeNormalizedChart.jsx`: Error profile vs altitude with threshold crossing
- `Controls.jsx`: User interface for parameter selection

**Deployment**
- **Repository**: GitHub (public/private as configured)
- **CI/CD**: Automatic Vercel deployment on push to main
- **Production**: Live web application

**MATLAB Reference**
- Original script: `wmm_altitude_task2_plots_2.m`
- Validation: Web app calculations verified against MATLAB outputs
