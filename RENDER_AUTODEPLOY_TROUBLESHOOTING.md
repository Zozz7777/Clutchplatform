# 🚀 Render Automatic Deployment Troubleshooting Guide

## Issues Identified and Fixed

### 1. **Conflicting Render Configuration Files** ✅ FIXED
**Problem**: Multiple `render.yaml` files with different configurations causing deployment confusion.

**Solution**: 
- Updated main `render.yaml` to use `rootDir: shared-backend`
- Simplified build commands to be consistent
- Fixed clutch-admin build command to use standard npm commands

### 2. **Inconsistent Build Commands** ✅ FIXED
**Problem**: Different build commands across configuration files.

**Solution**:
- Main backend: `npm install --legacy-peer-deps` (with rootDir: shared-backend)
- Admin frontend: `npm ci && npm run build`

### 3. **Missing Root Directory Configuration** ✅ FIXED
**Problem**: Main render.yaml didn't specify rootDir, causing deployment confusion.

**Solution**: Added `rootDir: shared-backend` to main configuration.

## Common Automatic Deployment Issues & Solutions

### Issue 1: GitHub Webhook Not Triggering
**Symptoms**: Manual deployments work, but automatic deployments don't trigger on git push.

**Solutions**:
1. **Check GitHub Integration**:
   - Go to Render Dashboard → Your Service → Settings → Build & Deploy
   - Verify "Auto-Deploy" is enabled
   - Check if GitHub repository is properly connected

2. **Verify Webhook Configuration**:
   - Go to your GitHub repository → Settings → Webhooks
   - Look for Render webhook (should be `https://api.render.com/v1/services/{service-id}/deploys`)
   - Check if webhook is active and receiving events

3. **Check Branch Configuration**:
   - Ensure you're pushing to the correct branch (usually `main` or `master`)
   - Verify the branch is set as the deployment branch in Render

### Issue 2: Build Failures Preventing Deployment
**Symptoms**: Automatic deployment starts but fails during build process.

**Solutions**:
1. **Check Build Logs**:
   - Go to Render Dashboard → Your Service → Deploys
   - Click on failed deployment to see build logs
   - Look for specific error messages

2. **Common Build Issues**:
   - Missing dependencies in package.json
   - Incorrect Node.js version
   - Build command errors
   - Environment variable issues

### Issue 3: Environment Variable Issues
**Symptoms**: Deployment succeeds but application fails to start.

**Solutions**:
1. **Check Environment Variables**:
   - Go to Render Dashboard → Your Service → Environment
   - Verify all required environment variables are set
   - Check for typos in variable names

2. **Sync Environment Variables**:
   - Variables marked with `sync: false` in render.yaml need to be set manually
   - Go to Environment tab and add missing variables

### Issue 4: Service Not Starting After Deployment
**Symptoms**: Build succeeds but service doesn't start or crashes.

**Solutions**:
1. **Check Start Command**:
   - Verify start command in render.yaml matches package.json scripts
   - Ensure the command exists and is executable

2. **Check Health Check Path**:
   - Verify healthCheckPath is correct
   - Ensure the endpoint returns 200 status

## Manual Steps to Fix Automatic Deployment

### Step 1: Verify GitHub Integration
```bash
# Check if your repository is properly connected to Render
# Go to: https://dashboard.render.com
# Navigate to your service → Settings → Build & Deploy
```

### Step 2: Test Webhook Manually
```bash
# You can test the webhook by making a small change and pushing:
git add .
git commit -m "test: trigger automatic deployment"
git push origin main
```

### Step 3: Check Deployment Logs
```bash
# Monitor the deployment in Render dashboard
# Look for any error messages in the build logs
```

### Step 4: Verify Service Health
```bash
# After deployment, test the service:
curl https://clutch-main-nk7x.onrender.com/health
curl https://clutch-admin.onrender.com/
```

## Configuration Files Updated

### 1. Main render.yaml (Root)
```yaml
services:
  - type: web
    name: clutch-main-nk7x
    env: node
    plan: starter
    rootDir: shared-backend  # ✅ ADDED
    buildCommand: npm install --legacy-peer-deps  # ✅ SIMPLIFIED
    startCommand: npm start  # ✅ SIMPLIFIED
    autoDeploy: true  # ✅ CONFIRMED
```

### 2. clutch-admin/render.yaml
```yaml
services:
  - type: web
    name: clutch-admin
    env: node
    buildCommand: npm ci && npm run build  # ✅ FIXED
    startCommand: npm start
    autoDeploy: true  # ✅ CONFIRMED
```

## Next Steps

1. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "fix: resolve render automatic deployment issues"
   git push origin main
   ```

2. **Monitor Deployment**:
   - Watch the Render dashboard for automatic deployment
   - Check build logs for any errors

3. **Test Services**:
   - Verify backend health: `https://clutch-main-nk7x.onrender.com/health`
   - Verify admin panel: `https://clutch-admin.onrender.com/`

4. **If Issues Persist**:
   - Check Render service logs
   - Verify GitHub webhook configuration
   - Contact Render support if needed

## Troubleshooting Commands

```bash
# Test backend health
curl -f https://clutch-main-nk7x.onrender.com/health

# Test admin panel
curl -f https://clutch-admin.onrender.com/

# Check deployment status
curl -f https://api.render.com/v1/services/{service-id}/deploys
```

## Support Resources

- [Render Documentation](https://render.com/docs)
- [GitHub Webhooks Guide](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [Render Support](https://render.com/support)
