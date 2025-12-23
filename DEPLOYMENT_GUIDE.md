# Deployment Guide: geomag.info

Complete guide to deploying the WMM Altitude Viewer to your custom domain **geomag.info**.

---

## Overview

**Recommended Stack:**
- **Version Control**: GitHub (free)
- **Hosting**: Vercel (free tier, best for React/Vite apps)
- **Domain**: geomag.info (Google Domains)
- **CDN**: Automatic via Vercel
- **HTTPS**: Automatic via Vercel

**Why Vercel?**
- ✅ Zero-config deployment for Vite apps
- ✅ Automatic HTTPS/SSL certificates
- ✅ Global CDN (fast worldwide)
- ✅ Auto-deploy on git push
- ✅ Free tier is generous
- ✅ Preview deployments for testing
- ✅ Built-in analytics

**Alternatives:**
- Netlify (very similar to Vercel)
- Cloudflare Pages (good if you use Cloudflare DNS)
- GitHub Pages (free but more setup)

---

## Step 1: Initialize Git Repository

```bash
cd /Users/manojnair/projects/wmm_altitude/wmm_altitude_web_app

# Initialize git (if not already done)
git init

# Check what will be committed
git status

# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: WMM Altitude Viewer with NOAA integration"
```

**Important**: The `.gitignore` file already excludes:
- ❌ `node_modules/` (too large)
- ❌ `public/data/*.json` (your large G*.json data files)
- ❌ `wmm_web_data/` (MATLAB export folder)

This means your **data files won't be in git**. We'll handle this separately in Step 4.

---

## Step 2: Create GitHub Repository

### Option A: Via GitHub Website (Easiest)

1. Go to https://github.com/new
2. Repository name: `wmm-altitude-viewer` (or `geomag-info`)
3. Description: "WMM Altitude Viewer - Geomagnetic field error analysis"
4. Visibility: **Public** (required for free Vercel) or **Private** (works with Vercel Pro)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Option B: Via GitHub CLI (if installed)

```bash
# Create repo on GitHub
gh repo create wmm-altitude-viewer --public --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

### Option C: Manual Setup

```bash
# Create empty repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/wmm-altitude-viewer.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1: Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub (easiest - auto-links your repos)
3. Authorize Vercel to access your GitHub repositories

### 3.2: Import Project

1. Click "Add New..." → "Project"
2. Select your GitHub repository: `wmm-altitude-viewer`
3. Vercel will auto-detect: **Framework: Vite**
4. **Build Settings** (should be auto-filled):
   - **Build Command**: `npm run build` or `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

### 3.3: Wait for Build

- First deploy takes 1-2 minutes
- Vercel will build and deploy automatically
- You'll get a URL like: `https://wmm-altitude-viewer.vercel.app`

### 3.4: Test Deployment

⚠️ **IMPORTANT**: The deployment will work BUT your data files won't be there yet (they're in `.gitignore`).

You'll see the error: "Failed to load G0.json"

**This is expected!** We'll fix this in Step 4.

---

## Step 4: Upload Data Files to Vercel

Since your `public/data/*.json` files are large (~10-50MB each) and excluded from git, you need to upload them separately.

### Option A: Remove from .gitignore (Simple but not ideal)

If your JSON files are < 100MB total:

1. **Temporarily** allow data files in git:
   ```bash
   # Edit .gitignore - comment out this line:
   # public/data/*.json
   ```

2. Add and commit data files:
   ```bash
   git add public/data/*.json
   git commit -m "Add WMM data files for deployment"
   git push
   ```

3. Vercel will auto-deploy with data files included

**Pros**: Simple
**Cons**: Large files in git history forever, slow git operations

### Option B: Use Vercel Environment Variables + CDN (Recommended)

Host your large data files elsewhere and fetch them at runtime:

1. Upload `G*.json` files to a CDN:
   - Google Cloud Storage (free tier)
   - AWS S3 + CloudFront
   - Backblaze B2 (very cheap)

2. Update your app to fetch from CDN URL:
   ```javascript
   // In App.jsx
   const DATA_URL = import.meta.env.VITE_DATA_URL || '/data';
   fetch(`${DATA_URL}/G${gScale}.json`)
   ```

3. Set environment variable in Vercel:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_DATA_URL` = `https://your-cdn.com/data`

**Pros**: Fast, clean git history, easy to update data independently
**Cons**: Requires setting up a CDN

### Option C: Git LFS (Git Large File Storage)

Use Git LFS to track large files efficiently:

```bash
# Install Git LFS
brew install git-lfs
git lfs install

# Track JSON files with LFS
git lfs track "public/data/*.json"
git add .gitattributes
git add public/data/*.json
git commit -m "Add data files via Git LFS"
git push
```

**Pros**: Clean solution for large files
**Cons**: Requires Git LFS setup on Vercel (supported but needs configuration)

### **My Recommendation for You:**

Since you have 6 files (G0-G5) × ~10-50MB each, I recommend **Option A** for simplicity:

```bash
# 1. Edit .gitignore - remove or comment out these lines:
#    public/data/*.json
#    wmm_web_data/

# 2. Add data files
git add public/data/
git commit -m "Add WMM geomagnetic data files (G0-G5)"
git push

# Vercel will auto-deploy
```

---

## Step 5: Configure Custom Domain (geomag.info)

### 5.1: In Vercel Dashboard

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add domain: `geomag.info`
4. Also add: `www.geomag.info` (recommended)
5. Vercel will show you DNS configuration instructions

### 5.2: Get DNS Settings from Vercel

Vercel will provide DNS records like:

**For apex domain (geomag.info):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3: Update DNS in Google Domains

Since you bought geomag.info through Google Domains:

1. Go to https://domains.google.com/registrar/
2. Find **geomag.info** → Click "Manage"
3. Go to "DNS" tab
4. **Option A: Use Custom Name Servers (Recommended)**
   - Click "Use custom name servers"
   - Add Vercel's name servers:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - This gives Vercel full DNS control (easier)

5. **Option B: Add DNS Records Manually**
   - Scroll to "Custom resource records"
   - Add A record for apex domain:
     - Name: `@`
     - Type: `A`
     - TTL: `3600`
     - Data: `76.76.21.21` (Vercel's IP)
   - Add CNAME for www:
     - Name: `www`
     - Type: `CNAME`
     - TTL: `3600`
     - Data: `cname.vercel-dns.com`

### 5.4: Wait for DNS Propagation

- DNS changes take 5 minutes to 48 hours (usually <1 hour)
- Check status: https://dnschecker.org/#A/geomag.info
- Vercel will automatically issue SSL certificate when DNS is ready

### 5.5: Verify HTTPS

Once DNS propagates:
- Visit: https://geomag.info ✅
- Visit: https://www.geomag.info ✅
- Both should work with HTTPS (🔒 padlock icon)

---

## Step 6: Configure Redirects (Optional but Recommended)

Create a `vercel.json` file to handle redirects:

```json
{
  "redirects": [
    {
      "source": "/",
      "has": [
        {
          "type": "host",
          "value": "www.geomag.info"
        }
      ],
      "destination": "https://geomag.info",
      "permanent": true
    }
  ]
}
```

This redirects `www.geomag.info` → `geomag.info` (cleaner URLs).

---

## Step 7: Enable Analytics (Optional)

### Vercel Analytics (Recommended)

1. Go to Vercel Dashboard → Project → Analytics
2. Enable "Vercel Analytics" (free tier: 2,500 events/month)
3. Shows pageviews, performance metrics, etc.

### Google Analytics (if needed)

Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Deployment Workflow (After Initial Setup)

Once everything is configured, future updates are automatic:

```bash
# 1. Make changes to your code
# 2. Commit changes
git add .
git commit -m "Update feature X"
git push

# 3. Vercel automatically deploys! 🚀
```

**No manual deployment needed** - Vercel watches your GitHub repo and auto-deploys on every push to `main`.

---

## Post-Deployment Checklist

- [ ] Site loads at https://geomag.info
- [ ] HTTPS certificate is active (🔒 padlock)
- [ ] Data files (G0-G5.json) load correctly
- [ ] NOAA forecast integration works
- [ ] Maps render correctly
- [ ] Charts display properly
- [ ] Mobile view works (test on phone)
- [ ] Performance is good (test with browser DevTools)

---

## Troubleshooting

### Issue: "Failed to load G0.json"

**Solution**: Data files aren't deployed. Follow Step 4 to upload them.

### Issue: Domain not working after 24 hours

**Solution**:
1. Check DNS at https://dnschecker.org/#A/geomag.info
2. Verify DNS records in Google Domains match Vercel's instructions
3. Try using Vercel's nameservers (easier than manual DNS)

### Issue: CORS error with NOAA forecast

**Solution**:
- NOAA SWPC allows CORS, but if blocked, the app gracefully falls back to G0
- Check browser console for specific error
- App should still work even if NOAA fetch fails

### Issue: Build fails on Vercel

**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure `package.json` has correct build script: `"build": "vite build"`
3. Verify Node.js version (Vercel uses latest LTS by default)

### Issue: Slow load times

**Solution**:
1. Data files are large - consider compressing them (gzip)
2. Vercel automatically gzips, but you can pre-compress
3. Consider lazy-loading data files (only load selected G-scale)

---

## Cost Estimate

**Total Monthly Cost: $0** (Free Tier)

- **Vercel**: Free tier
  - 100 GB bandwidth/month
  - Unlimited deployments
  - HTTPS included
- **GitHub**: Free (public repo)
- **Google Domains**: ~$12/year (already paid)

**Upgrade if needed:**
- Vercel Pro: $20/month (more bandwidth, better analytics)
- Only needed if you exceed free tier limits

---

## Security Best Practices

1. **HTTPS Only**: Vercel enforces this automatically ✅
2. **No sensitive data in git**: Data files are public anyway ✅
3. **Environment variables**: Keep any API keys in Vercel env vars (not in code)
4. **CORS**: NOAA SWPC allows it, no issues ✅
5. **Content Security Policy**: Consider adding CSP headers in `vercel.json`

---

## Maintenance

### Updating Data Files

When you regenerate data from MATLAB:

```bash
# 1. Export from MATLAB
cd /Users/manojnair/projects/wmm_altitude
matlab -batch "export_wmm_for_web"

# 2. Copy to web app
cp wmm_web_data/*.json wmm_altitude_web_app/public/data/

# 3. Commit and push
cd wmm_altitude_web_app
git add public/data/*.json
git commit -m "Update WMM data files"
git push

# 4. Vercel auto-deploys! 🚀
```

### Monitoring

- Check Vercel dashboard weekly for:
  - Deployment status
  - Error logs
  - Bandwidth usage
  - Performance metrics

---

## Next Steps

1. **Now**: Commit code to GitHub
2. **Now**: Deploy to Vercel
3. **Now**: Upload data files
4. **Wait 1-24h**: DNS propagation
5. **Then**: Test https://geomag.info
6. **Optional**: Add analytics, monitoring
7. **Optional**: Share with colleagues!

---

## Questions?

**Common Questions:**

**Q: Can I use a different host instead of Vercel?**
A: Yes! Netlify and Cloudflare Pages are very similar. GitHub Pages is free but more manual.

**Q: Do I have to use GitHub?**
A: Not required, but highly recommended. Vercel supports GitLab and Bitbucket too.

**Q: How do I roll back if something breaks?**
A: In Vercel dashboard, go to "Deployments" and click "Promote to Production" on any previous deployment.

**Q: Can I password-protect the site?**
A: Yes, but requires Vercel Pro ($20/month) for password protection. Free tier is public only.

**Q: Will NOAA integration work after deployment?**
A: Yes! The browser fetches from NOAA client-side. CORS is allowed by NOAA SWPC.
