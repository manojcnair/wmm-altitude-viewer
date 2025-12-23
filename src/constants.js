// Altitude grid points (in km)
export const ALTITUDES = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  200, 300, 400, 500, 600, 700, 800, 900, 1000,
  2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000
];

// Magnetic field components
export const COMPONENTS = [
  { id: 'F', name: 'Total Field (F)', unit: 'nT', description: 'Total magnetic field intensity' },
  { id: 'H', name: 'Horizontal (H)', unit: 'nT', description: 'Horizontal component intensity' },
  { id: 'D', name: 'Declination (D)', unit: '°', description: 'Angle from true north' },
  { id: 'I', name: 'Inclination (I)', unit: '°', description: 'Angle from horizontal' },
  { id: 'X', name: 'North (X)', unit: 'nT', description: 'North component' },
  { id: 'Y', name: 'East (Y)', unit: 'nT', description: 'East component' },
  { id: 'Z', name: 'Down (Z)', unit: 'nT', description: 'Vertical component (positive down)' },
];

// Error thresholds for different specifications
export const THRESHOLDS = {
  MilSpec: {
    F: 280,
    H: 200,
    D: 1.0,
    I: 1.0,
    X: 140,
    Y: 140,
    Z: 200
  },
  WMM: {
    F: 148,
    H: 128,
    D: 0.42,
    I: 0.21,
    X: 131,
    Y: 94,
    Z: 157
  }
};

// Geomagnetic activity scale descriptions
export const G_SCALE_LABELS = [
  'G0 (Quiet)',
  'G1 (Minor Storm)',
  'G2 (Moderate Storm)',
  'G3 (Strong Storm)',
  'G4 (Severe Storm)',
  'G5 (Extreme Storm)'
];

// Jet colormap (MATLAB-style): blue → cyan → green → yellow → red
export function jetColormap(value, min, max) {
  // Handle NaN and invalid values
  if (isNaN(value) || value === null) {
    return 'rgba(128, 128, 128, 0.3)'; // Gray for NaN
  }

  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  let r, g, b;

  if (t < 0.125) {
    // Dark blue to blue
    r = 0;
    g = 0;
    b = 0.5 + t * 4;
  } else if (t < 0.375) {
    // Blue to cyan
    r = 0;
    g = (t - 0.125) * 4;
    b = 1;
  } else if (t < 0.625) {
    // Cyan to green to yellow
    r = (t - 0.375) * 4;
    g = 1;
    b = 1 - (t - 0.375) * 4;
  } else if (t < 0.875) {
    // Yellow to red
    r = 1;
    g = 1 - (t - 0.625) * 4;
    b = 0;
  } else {
    // Red to dark red
    r = 1 - (t - 0.875) * 4;
    g = 0;
    b = 0;
  }

  // Values exceeding threshold shown in white/light gray
  if (value > max) {
    return 'rgb(240, 240, 240)';
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// Legacy function for backward compatibility
export function valueToColor(value, maxValue) {
  return jetColormap(value, 0, maxValue);
}
