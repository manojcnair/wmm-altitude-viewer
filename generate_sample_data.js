// Generate sample WMM data for testing the UI
// Run with: node generate_sample_data.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lats = [-85, -75, -65, -55, -45, -35, -25, -15, -5, 5, 15, 25, 35, 45, 55, 65, 75, 85];
const lons = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315, 325, 335, 345, 355];
const altitudes = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

// Realistic base values at ground level (nT and degrees)
const baseValues = {
  F: 50000,  // Total field ~50,000 nT
  H: 30000,  // Horizontal ~30,000 nT
  X: 25000,  // North ~25,000 nT
  Y: 2000,   // East ~2,000 nT
  Z: 40000,  // Down ~40,000 nT
  D: 10,     // Declination ~10 degrees
  I: 60      // Inclination ~60 degrees
};

// Generate 3D grid with realistic spatial and altitude patterns
function generateGrid(component, gScale) {
  const grid = [];

  for (let latI = 0; latI < lats.length; latI++) {
    const latGrid = [];
    const lat = lats[latI];

    for (let lonI = 0; lonI < lons.length; lonI++) {
      const altGrid = [];
      const lon = lons[lonI];

      for (let altI = 0; altI < altitudes.length; altI++) {
        const alt = altitudes[altI];

        // Base error grows with altitude (log scale)
        const altFactor = 1 + Math.log10(1 + alt / 100) / 2;

        // Higher at poles for D and I
        const latFactor = component === 'D' || component === 'I'
          ? 1 + Math.abs(lat) / 100
          : 1 + Math.abs(lat) / 200;

        // Longitude variation (simulating crustal anomalies)
        const lonVariation = Math.sin(lon * Math.PI / 180) * 0.2 + 1;

        // G-scale factor (storms increase errors)
        const gFactor = 1 + gScale * 0.4;

        // Component-specific base errors (nT or degrees)
        let baseError;
        switch (component) {
          case 'F': baseError = 50; break;
          case 'H': baseError = 40; break;
          case 'X': baseError = 35; break;
          case 'Y': baseError = 30; break;
          case 'Z': baseError = 45; break;
          case 'D': baseError = 0.2; break;  // degrees
          case 'I': baseError = 0.15; break; // degrees
        }

        // Calculate error with realistic patterns
        let error = baseError * altFactor * latFactor * lonVariation * gFactor;

        // Add some random variation (±20%)
        error *= (0.9 + Math.random() * 0.2);

        // D can be NaN near poles (magnetic north/south)
        if (component === 'D' && Math.abs(lat) > 80 && Math.random() > 0.3) {
          error = null;
        }

        altGrid.push(Math.round(error * 100) / 100);
      }
      latGrid.push(altGrid);
    }
    grid.push(latGrid);
  }

  return grid;
}

// Generate altitude profile (global average)
function generateProfile(component, gScale) {
  const profile = [];

  for (let altI = 0; altI < altitudes.length; altI++) {
    const alt = altitudes[altI];

    // Base error grows with altitude
    const altFactor = 1 + Math.log10(1 + alt / 100) / 2;
    const gFactor = 1 + gScale * 0.4;

    let baseError;
    switch (component) {
      case 'F': baseError = 50; break;
      case 'H': baseError = 40; break;
      case 'X': baseError = 35; break;
      case 'Y': baseError = 30; break;
      case 'Z': baseError = 45; break;
      case 'D': baseError = 0.2; break;
      case 'I': baseError = 0.15; break;
    }

    const error = baseError * altFactor * gFactor * 1.1; // slightly higher than grid average
    profile.push(Math.round(error * 100) / 100);
  }

  return profile;
}

// Generate data for all G-scales
for (let g = 0; g <= 4; g++) {
  console.log(`Generating G${g}.json...`);

  const data = {
    gScale: g,
    lats: lats,
    lons: lons,
    altitudes: altitudes,

    // Grid data [lat][lon][alt]
    F: generateGrid('F', g),
    H: generateGrid('H', g),
    X: generateGrid('X', g),
    Y: generateGrid('Y', g),
    Z: generateGrid('Z', g),
    D: generateGrid('D', g),
    I: generateGrid('I', g),

    // Profile data [alt]
    profile_F: generateProfile('F', g),
    profile_H: generateProfile('H', g),
    profile_X: generateProfile('X', g),
    profile_Y: generateProfile('Y', g),
    profile_Z: generateProfile('Z', g),
    profile_D: generateProfile('D', g),
    profile_I: generateProfile('I', g)
  };

  const outputPath = path.join(__dirname, 'public', 'data', `G${g}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`✓ Generated G${g}.json (${sizeMB} MB)`);
}

console.log('\n✓ Sample data generation complete!');
console.log('Run "npm run dev" to see the app with sample data.');
