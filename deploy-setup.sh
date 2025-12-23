#!/bin/bash
# Quick deployment setup script for geomag.info
# Run this to initialize git and prepare for deployment

set -e  # Exit on error

echo "=========================================="
echo "  WMM Altitude Viewer - Deployment Setup"
echo "  Target: geomag.info"
echo "=========================================="
echo

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "✓ Initializing git repository..."
    git init
    git branch -M main
else
    echo "✓ Git repository already initialized"
fi

# Check if data files exist
echo
echo "Checking data files..."
if [ -f "public/data/G0.json" ]; then
    echo "✓ G0.json found"
    DATA_SIZE=$(du -sh public/data | cut -f1)
    echo "  Data directory size: $DATA_SIZE"

    # Ask about including data in git
    echo
    echo "⚠️  Your data files are currently excluded from git (.gitignore)"
    echo "   Options:"
    echo "   1) Include data files in git (simple, but large repo)"
    echo "   2) Keep excluded (you'll upload separately to Vercel)"
    echo
    read -p "Include data files in git? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "✓ Will include data files in commit"
        # Comment out the data exclusion in .gitignore
        if grep -q "^public/data/\*.json" .gitignore; then
            sed -i.bak 's/^public\/data\/\*\.json/# public\/data\/*.json/' .gitignore
            echo "  Modified .gitignore to allow data files"
        fi
    else
        echo "✓ Data files will remain excluded"
        echo "  Remember to upload them to Vercel separately!"
    fi
else
    echo "⚠️  No data files found in public/data/"
    echo "   You may need to run: export_wmm_for_web.m in MATLAB"
fi

# Stage files
echo
echo "Staging files for commit..."
git add .

# Show status
echo
echo "=========================================="
echo "Git Status:"
echo "=========================================="
git status

# Get commit message
echo
echo "Ready to commit!"
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit: WMM Altitude Viewer with NOAA integration"
fi

echo
echo "Creating commit: \"$COMMIT_MSG\""
git commit -m "$COMMIT_MSG"

# Check if remote exists
echo
if git remote | grep -q "origin"; then
    echo "✓ Git remote 'origin' already configured"
    echo "  URL: $(git remote get-url origin)"
    echo
    read -p "Push to GitHub now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main
        echo "✓ Pushed to GitHub!"
    fi
else
    echo "⚠️  No git remote configured yet"
    echo
    echo "Next steps:"
    echo "1. Create a GitHub repository at https://github.com/new"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "3. Run: git push -u origin main"
fi

echo
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo
echo "Next steps:"
echo "1. Push to GitHub (if not done already)"
echo "2. Sign up at https://vercel.com (use GitHub login)"
echo "3. Import your repository in Vercel"
echo "4. Configure custom domain: geomag.info"
echo
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
echo
