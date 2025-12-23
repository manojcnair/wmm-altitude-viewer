# WMM Data Directory

This directory should contain the exported JSON files from MATLAB.

## Required Files

- **G0.json** - Quiet geomagnetic conditions
- **G1.json** - Minor storm
- **G2.json** - Moderate storm
- **G3.json** - Strong storm
- **G4.json** - Severe storm

## How to Generate

1. Place your `G*_data_with_commission.mat` files in a directory
2. Copy `export_wmm_for_web.m` to that directory
3. Run in MATLAB: `export_wmm_for_web`
4. Copy the generated JSON files here

## File Structure

Each JSON file should be approximately 10-50 MB and contain:

```json
{
  "gScale": 0,
  "lats": [-85, -75, -65, -55, -45, -35, -25, -15, -5, 5, 15, 25, 35, 45, 55, 65, 75, 85],
  "lons": [5, 15, 25, 35, ... 355],
  "altitudes": [0, 10, 20, 30, ..., 10000],
  "F": [18][36][29] array,
  "H": [18][36][29] array,
  "D": [18][36][29] array,
  "I": [18][36][29] array,
  "X": [18][36][29] array,
  "Y": [18][36][29] array,
  "Z": [18][36][29] array,
  "profile_F": [29] array,
  "profile_H": [29] array,
  "profile_D": [29] array,
  "profile_I": [29] array,
  "profile_X": [29] array,
  "profile_Y": [29] array,
  "profile_Z": [29] array
}
```

## Testing Without Real Data

For testing the UI without MATLAB data, you can create a minimal test file:

```bash
echo '{"gScale":0,"lats":[-85,-75,-65,-55,-45,-35,-25,-15,-5,5,15,25,35,45,55,65,75,85],"lons":[5,15,25,35,45,55,65,75,85,95,105,115,125,135,145,155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305,315,325,335,345,355],"altitudes":[0,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000,2000,3000,4000,5000,6000,7000,8000,9000,10000]}' > G0.json
```

Note: This will only show the structure; add actual grid and profile arrays for visualization.
