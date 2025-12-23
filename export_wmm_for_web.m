% export_wmm_for_web.m
% Export WMM altitude error data for web visualization
%
% INSTRUCTIONS:
% 1. Place this script in the same directory as your G*_data_with_commission.mat files
% 2. Run in MATLAB: export_wmm_for_web
% 3. Copy the generated 'wmm_web_data' folder to your React app's 'public/data' directory
%
% This will create JSON files (G0.json through G4.json) containing:
% - Grid data: [lat, lon, altitude] arrays for all 7 field components
% - Profile data: Global averages across altitude
% - Coordinate arrays: lats, lons, altitudes

output_dir = '/Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app/wmm_web_data/';
if ~exist(output_dir, 'dir')
    mkdir(output_dir);
end

% Define coordinate grids
lats = -85:10:85;    % 18 values
lons = 5:10:355;     % 36 values
altitudes = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, ...
             200, 300, 400, 500, 600, 700, 800, 900, 1000, ...
             2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

fprintf('Exporting WMM altitude error data for web app...\n');
fprintf('Grid size: %d lats × %d lons × %d altitudes\n', ...
    length(lats), length(lons), length(altitudes));

% Load WMM nominal field data (needed for normalized error calculations)
wmm_data_file = '/Users/manojnair/projects/wmm_altitude/WMM_data.mat';
if exist(wmm_data_file, 'file')
    WMM = load(wmm_data_file);
    fprintf('Loaded WMM nominal field data\n');
else
    warning('WMM_data.mat not found - normalized error profiles will not be available');
    WMM = struct();
end

for g = 0:5
    % Try v4 first (with altitude limits), fallback to v3
    data_dir = '/Users/manojnair/projects/wmm_altitude/';
    filename_v4 = sprintf('%sG%d_data_with_commission_v4.mat', data_dir, g);
    filename_v3 = sprintf('%sG%d_data_with_commission_v3.mat', data_dir, g);
    filename_old = sprintf('%sG%d_data_with_commission.mat', data_dir, g);

    if exist(filename_v4, 'file')
        filename = filename_v4;
    elseif exist(filename_v3, 'file')
        filename = filename_v3;
    elseif exist(filename_old, 'file')
        filename = filename_old;
    else
        warning('No data file found for G%d - Skipping', g);
        continue;
    end

    fprintf('Processing %s... ', filename);
    data = load(filename);

    % Create export structure
    export = struct();
    export.lats = lats;
    export.lons = lons;
    export.altitudes = altitudes;
    export.gScale = g;

    % Grid data: reshape to [lat, lon, alt] format
    % Original data is [alt, lon, lat], we need [lat, lon, alt]
    % Note: D and I are in radians, convert to degrees
    export.X = permute(data.Combined_X_rms, [3, 2, 1]);
    export.Y = permute(data.Combined_Y_rms, [3, 2, 1]);
    export.Z = permute(data.Combined_Z_rms, [3, 2, 1]);
    export.F = permute(data.Combined_F_rms, [3, 2, 1]);
    export.H = permute(data.Combined_H_rms, [3, 2, 1]);
    export.D = permute(data.Combined_D_rms, [3, 2, 1]) * (180/pi);  % radians to degrees
    export.I = permute(data.Combined_I_rms, [3, 2, 1]) * (180/pi);  % radians to degrees

    % Profile data: global averages across altitude (already 1D arrays)
    export.profile_X = data.Combined_X_average;
    export.profile_Y = data.Combined_Y_average;
    export.profile_Z = data.Combined_Z_average;
    export.profile_F = data.Combined_F_average;
    export.profile_H = data.Combined_H_average;
    export.profile_D = data.Combined_D_average * (180/pi);  % radians to degrees
    export.profile_I = data.Combined_I_average * (180/pi);  % radians to degrees

    % WMM nominal field averages (for normalized error calculations)
    if isfield(WMM, 'WMM_F_average')
        export.wmm_F_average = WMM.WMM_F_average;
        export.wmm_H_average = WMM.WMM_H_average;
        export.wmm_X_average = WMM.WMM_X_average;
        export.wmm_Y_average = WMM.WMM_Y_average;
        export.wmm_Z_average = WMM.WMM_Z_average;
        fprintf('(with WMM nominal fields) ');
    end

    % Altitude Limit grids (2D arrays [lon, lat] → permute to [lat, lon])
    % MilSpec Error Model altitude limits
    if isfield(data, 'Combined_F_height_Milspec')
        export.F_alt_limit_milspec = permute(data.Combined_F_height_Milspec, [2, 1]);
        export.D_alt_limit_milspec = permute(data.Combined_D_height_Milspec, [2, 1]);
        export.I_alt_limit_milspec = permute(data.Combined_I_height_Milspec, [2, 1]);
        export.H_alt_limit_milspec = permute(data.Combined_H_height_Milspec, [2, 1]);
        export.X_alt_limit_milspec = permute(data.Combined_X_height_Milspec, [2, 1]);
        export.Y_alt_limit_milspec = permute(data.Combined_Y_height_Milspec, [2, 1]);
        export.Z_alt_limit_milspec = permute(data.Combined_Z_height_Milspec, [2, 1]);
        fprintf('(with MilSpec limits) ');
    end

    % WMM Error Model altitude limits
    if isfield(data, 'Combined_F_height_WMM')
        export.F_alt_limit_wmm = permute(data.Combined_F_height_WMM, [2, 1]);
        export.D_alt_limit_wmm = permute(data.Combined_D_height_WMM, [2, 1]);
        export.I_alt_limit_wmm = permute(data.Combined_I_height_WMM, [2, 1]);
        export.H_alt_limit_wmm = permute(data.Combined_H_height_WMM, [2, 1]);
        export.X_alt_limit_wmm = permute(data.Combined_X_height_WMM, [2, 1]);
        export.Y_alt_limit_wmm = permute(data.Combined_Y_height_WMM, [2, 1]);
        export.Z_alt_limit_wmm = permute(data.Combined_Z_height_WMM, [2, 1]);
        fprintf('(with WMM limits) ');
    end

    % Write JSON file
    json_str = jsonencode(export);
    output_file = sprintf('%sG%d.json', output_dir, g);
    fid = fopen(output_file, 'w');
    if fid == -1
        error('Could not open file for writing: %s', output_file);
    end
    fwrite(fid, json_str, 'char');
    fclose(fid);

    fprintf('✓ Exported to %s (%.2f MB)\n', output_file, length(json_str)/1024/1024);
end

fprintf('\n✓ Export complete!\n');
fprintf('Next step: Copy the "%s" folder to your React app''s public directory:\n', output_dir);
fprintf('  cp -r %s <your-react-app>/public/data\n', output_dir);
