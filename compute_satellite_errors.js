// Compute corrected satellite RMS errors and export as JSON for the web app.
// Pipeline: raw WMM errors → subtract inferred secular variation → add commission errors
//
// Run with: node compute_satellite_errors.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SWARM_DIR = '/Users/manojnair/projects/wmm_altitude/Swarm';

// Commission errors from WMM error budget (Nair et al. 2025)
const COMMISSION = { X: 46, Y: 53, Z: 84, H: 47, D: 0.20, I: 0.11, F: 64 };

// Satellite file definitions
const SATELLITES = [
  {
    name: 'Swarm A',
    wmmXYZ: 'GlobalRMS_SwarmA_WMM2015_20150101_20191231_ver3.txt',
    wmmHDIF: 'GlobalRMS_SwarmA_WMM2015_20150101_20191231_ver3_HDIF_2017.0000.txt',
    chaosXYZ: 'older_versions/GlobalRMS_SwarmA_ch7d17_20150101_20191231_ver3.txt',
    chaosHDIF: 'older_versions/GlobalRMS_SwarmA_ch7d17_20150101_20191231_ver3_HDIF_2017.0000.txt',
  },
  {
    name: 'Swarm B',
    wmmXYZ: 'GlobalRMS_SwarmB_WMM2015_20150101_20191231_ver3.txt',
    wmmHDIF: 'GlobalRMS_SwarmB_WMM2015_20150101_20191231_ver3_HDIF_2017.0000.txt',
    chaosXYZ: 'older_versions/GlobalRMS_SwarmB_ch7d17_20150101_20191231_ver3.txt',
    chaosHDIF: 'older_versions/GlobalRMS_SwarmB_ch7d17_20150101_20191231_ver3_HDIF_2017.0000.txt',
  },
  {
    name: 'CHAMP',
    wmmXYZ: 'GlobalRMS_CHAMP_WMM2005_20050101_20091231.txt',
    wmmHDIF: 'GlobalRMS_CHAMP_WMM2005_20050101_20091231_HDIF_2007.0000.txt',
    chaosXYZ: 'GlobalRMS_CHAMP_ch8d2_20050101_20091231.txt',
    chaosHDIF: 'GlobalRMS_CHAMP_ch8d2_20050101_20091231_HDIF_2007.0000.txt',
  },
  {
    name: 'CryoSat-2',
    wmmXYZ: 'GlobalRMS_CryoSat2_WMM2015_20150101_20191231.txt',
    wmmHDIF: 'GlobalRMS_CryoSat2_WMM2015_20150101_20191231_HDIF_2017.0000.txt',
    chaosXYZ: 'older_versions/GlobalRMS_CryoSat2_ch7d17_20150101_20191231.txt',
    chaosHDIF: 'older_versions/GlobalRMS_CryoSat2_ch7d17_20150101_20191231_HDIF_2017.0000.txt',
  },
];

// Parse XYZ file: returns array of {g, alt, X, Y, Z} for G0-G4
function parseXYZ(filepath) {
  const lines = fs.readFileSync(path.join(SWARM_DIR, filepath), 'utf-8')
    .trim().split('\n').slice(1); // skip header
  return lines.map(line => {
    const parts = line.split(',').map(s => s.trim());
    return {
      g: parseInt(parts[0].replace('G', '')),
      alt: parseFloat(parts[1]),
      X: parseFloat(parts[2]),
      Y: parseFloat(parts[3]),
      Z: parseFloat(parts[4]),
    };
  });
}

// Parse HDIF file: returns array of {g, alt, H, D, I, F} for G0-G4
function parseHDIF(filepath) {
  const lines = fs.readFileSync(path.join(SWARM_DIR, filepath), 'utf-8')
    .trim().split('\n').slice(1); // skip header
  return lines.map(line => {
    const parts = line.split(',').map(s => s.trim());
    return {
      g: parseInt(parts[0].replace('G', '')),
      alt: parseFloat(parts[1]),
      H: parseFloat(parts[2]),
      D: parseFloat(parts[3]),
      I: parseFloat(parts[4]),
      F: parseFloat(parts[5]),
    };
  });
}

function round4(v) {
  return Math.round(v * 10000) / 10000;
}

const result = { satellites: [] };

for (const sat of SATELLITES) {
  console.log(`Processing ${sat.name}...`);

  const wmmXYZ = parseXYZ(sat.wmmXYZ);
  const wmmHDIF = parseHDIF(sat.wmmHDIF);
  const chaosXYZ = parseXYZ(sat.chaosXYZ);
  const chaosHDIF = parseHDIF(sat.chaosHDIF);

  // Compute inferred secular variation from G0 data
  const sv = {
    X: Math.sqrt(Math.max(0, wmmXYZ[0].X ** 2 - chaosXYZ[0].X ** 2)),
    Y: Math.sqrt(Math.max(0, wmmXYZ[0].Y ** 2 - chaosXYZ[0].Y ** 2)),
    Z: Math.sqrt(Math.max(0, wmmXYZ[0].Z ** 2 - chaosXYZ[0].Z ** 2)),
    H: Math.sqrt(Math.max(0, wmmHDIF[0].H ** 2 - chaosHDIF[0].H ** 2)),
    D: Math.sqrt(Math.max(0, wmmHDIF[0].D ** 2 - chaosHDIF[0].D ** 2)),
    I: Math.sqrt(Math.max(0, wmmHDIF[0].I ** 2 - chaosHDIF[0].I ** 2)),
    F: Math.sqrt(Math.max(0, wmmHDIF[0].F ** 2 - chaosHDIF[0].F ** 2)),
  };

  console.log(`  SV: X=${sv.X.toFixed(2)}, Y=${sv.Y.toFixed(2)}, Z=${sv.Z.toFixed(2)}, H=${sv.H.toFixed(2)}, D=${sv.D.toFixed(4)}, I=${sv.I.toFixed(4)}, F=${sv.F.toFixed(2)}`);

  // For each G-level (0-4), compute corrected errors
  const errors = { F: [], H: [], D: [], I: [], X: [], Y: [], Z: [] };
  const altitude = Math.round(wmmXYZ[0].alt); // Use G0 altitude as nominal

  for (let gi = 0; gi < 5; gi++) {
    // Remove SV then add commission for XYZ components
    for (const comp of ['X', 'Y', 'Z']) {
      const observed = wmmXYZ[gi][comp];
      const noSV = Math.sqrt(Math.max(0, observed ** 2 - sv[comp] ** 2));
      const final = Math.sqrt(noSV ** 2 + COMMISSION[comp] ** 2);
      errors[comp].push(round4(final));
    }

    // Remove SV then add commission for HDIF components
    for (const comp of ['H', 'D', 'I', 'F']) {
      const observed = wmmHDIF[gi][comp];
      const noSV = Math.sqrt(Math.max(0, observed ** 2 - sv[comp] ** 2));
      const final = Math.sqrt(noSV ** 2 + COMMISSION[comp] ** 2);
      errors[comp].push(round4(final));
    }
  }

  console.log(`  Altitude: ${altitude} km`);
  console.log(`  G0 corrected: F=${errors.F[0]}, X=${errors.X[0]}, Y=${errors.Y[0]}, Z=${errors.Z[0]}`);

  result.satellites.push({ name: sat.name, altitude, errors });
}

// Write output
const outputPath = path.join(__dirname, 'public', 'data', 'satellite_errors.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`\nWrote ${outputPath}`);
console.log('Done!');
