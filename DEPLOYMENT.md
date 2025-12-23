# Deployment Guide

## Prerequisites

1. Your data files (G0.json - G4.json) in `public/data/`
2. Production build tested locally: `npm run build && npm run preview`

## Option 1: Vercel (Recommended)

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via Web Interface

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Vite configuration
6. Click "Deploy"

**Note**: Large JSON files may hit Vercel's 100MB limit. Consider using external storage (see below).

## Option 2: Netlify

### Via CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Via Web Interface

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. "Add new site" → "Import from Git"
4. Select repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy

## Option 3: GitHub Pages

```bash
npm install -g gh-pages

# Add to package.json:
# "homepage": "https://yourusername.github.io/wmm-altitude-viewer",
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d dist"
# }

npm run deploy
```

Then enable GitHub Pages in your repository settings.

## Option 4: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Handling Large Data Files

If your JSON files exceed hosting limits (total > 100MB):

### Option A: External Storage (Recommended for Large Files)

1. **Upload to S3/GCS/Azure Storage**
   ```bash
   aws s3 sync public/data/ s3://your-bucket/wmm-data/ --acl public-read
   ```

2. **Update fetch URLs in App.jsx**
   ```jsx
   fetch(`https://your-bucket.s3.amazonaws.com/wmm-data/G${gScale}.json`)
   ```

3. **Enable CORS on your bucket**
   ```json
   {
     "CORSRules": [{
       "AllowedOrigins": ["https://your-app-domain.com"],
       "AllowedMethods": ["GET"],
       "AllowedHeaders": ["*"]
     }]
   }
   ```

### Option B: Compress Data

```bash
# In your MATLAB export script, use compression
import gzip
with gzip.open('G0.json.gz', 'wt') as f:
    json.dump(data, f)
```

Then fetch with compression handling in App.jsx.

### Option C: Split by Component

Modify export script to create separate files:
- `G0_F.json`, `G0_H.json`, etc.
- Load only the selected component
- Reduces initial load but increases requests

## Environment Variables

For production, create `.env.production`:

```env
VITE_DATA_BASE_URL=https://your-cdn.com/data
```

Then in App.jsx:
```jsx
const dataUrl = `${import.meta.env.VITE_DATA_BASE_URL}/G${gScale}.json`;
```

## Performance Optimization

### 1. Enable Compression

Most hosts enable gzip/brotli automatically. Verify:
```bash
curl -H "Accept-Encoding: gzip" -I https://your-app.com/data/G0.json
```

### 2. CDN Caching

Add cache headers (Netlify `_headers` file):
```
/data/*.json
  Cache-Control: public, max-age=31536000, immutable
```

### 3. Code Splitting

For very large apps, split by route:
```jsx
const MapView = lazy(() => import('./components/MapView'));
```

## Pre-Deployment Checklist

- [ ] Test production build locally: `npm run build && npm run preview`
- [ ] All 5 data files (G0-G4) present
- [ ] No console errors in production
- [ ] Map renders correctly
- [ ] Charts display data
- [ ] All controls functional
- [ ] Mobile responsive (if applicable)
- [ ] Check bundle size: `ls -lh dist/assets/*.js`

## Post-Deployment Testing

```bash
# Test from different location
curl -I https://your-app.com

# Check all data files accessible
curl -I https://your-app.com/data/G0.json
curl -I https://your-app.com/data/G4.json

# Verify CORS (if using external storage)
curl -H "Origin: https://your-app.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS https://your-cdn.com/data/G0.json
```

## Monitoring

### Analytics (Optional)

Add to `index.html`:
```html
<!-- Google Analytics, Plausible, etc. -->
```

### Error Tracking (Optional)

```bash
npm install @sentry/react
```

In `main.jsx`:
```jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## Updating Data

When you have new MATLAB results:

1. Run `export_wmm_for_web.m`
2. Upload new JSON files
3. Clear CDN cache (if applicable)
4. Users will automatically get new data on next visit

## Troubleshooting Deployment

### "Module not found" errors
- Ensure all imports use correct case (case-sensitive in production)
- Check that all files are committed to git

### "Failed to fetch" errors
- Verify data files are in `public/data/` before building
- Check browser console for CORS errors
- Ensure file paths are relative, not absolute

### Map tiles not loading
- Check Leaflet CSS is properly imported
- Verify tile URL in MapView.jsx is accessible
- Consider using self-hosted tiles for offline use

### Large bundle size warning
- Leaflet and Recharts are large libraries (this is expected)
- Current bundle (~700KB) is reasonable for a data-viz app
- Consider lazy loading if you add more features

## Cost Estimates

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Netlify**: Free tier includes 100GB bandwidth/month
- **GitHub Pages**: Free, unlimited for public repos
- **AWS S3**: ~$0.023/GB storage + $0.09/GB transfer
- **CloudFront CDN**: ~$0.085/GB transfer (first 10TB)

For a typical research app with <100 users/month: **$0-5/month**

## Custom Domain

After deployment, add your domain:

**Vercel/Netlify**: Settings → Domains → Add custom domain

**DNS Records**:
```
CNAME   wmm     your-app.vercel.app
```

## Security

For public research tools:
- No authentication needed
- Data is already public (WMM is open)
- Enable HTTPS (automatic on all platforms)
- No user data collected (by default)

For restricted access:
- Add basic auth via Netlify/Vercel password protection
- Or implement OAuth/SSO if needed

---

Your app is now live and accessible worldwide! 🚀
