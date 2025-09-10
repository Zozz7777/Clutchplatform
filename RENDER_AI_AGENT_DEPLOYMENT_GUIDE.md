# 🚀 Render AI Agent Deployment Guide

## Overview

This guide will help you deploy the Enterprise AI Developer system to Render with automatic setup and configuration.

## ✅ Prerequisites

- Render account with your backend service already deployed
- OpenAI API key configured in Render environment variables
- Backend service running on Render

## 🔧 Step 1: Configure Environment Variables in Render

Go to your Render dashboard → Your Service → Environment and add/verify these variables:

### Required Environment Variables:
```
AI_MONITORING_ENABLED=true
AI_AUTO_FIX_ENABLED=true
AI_CHECK_INTERVAL=*/5 * * * *
OPENAI_API_KEY=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
BACKEND_URL=https://clutch-main-nk7x.onrender.com
ADMIN_URL=https://admin.yourclutch.com
AI_DASHBOARD_PORT=3002
```

### Optional Environment Variables:
```
RENDER_API_KEY=your-render-api-key (for log monitoring)
RENDER_SERVICE_ID=your-service-id (for log monitoring)
WEBHOOK_URL=your-slack-webhook-url (for notifications)
ADMIN_API_KEY=your-admin-api-key (for admin actions)
```

## 📦 Step 2: Update Your Repository

The render.yaml file has been updated with:
- AI agent configuration
- Automatic deployment setup
- Environment variable configuration

## 🚀 Step 3: Deploy to Render

### Option A: Automatic Deployment (Recommended)
1. Commit and push your changes to your main branch
2. Render will automatically detect changes and redeploy
3. The AI agent will be set up automatically during deployment

### Option B: Manual Deployment
1. Go to your Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Monitor the deployment logs for AI agent setup

## 📊 Step 4: Verify Deployment

### Check Deployment Logs
1. Go to your Render service dashboard
2. Click on "Logs" tab
3. Look for these messages:
   ```
   🤖 Initializing AI Monitoring Agent...
   ✅ AI Monitoring Agent started successfully
   👨‍💻 Enterprise AI Developer: Alex Chen ready
   ```

### Test AI Agent Endpoints
```bash
# Check AI agent status
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/status

# Test health check
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/health-check

# Get developer capabilities
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/capabilities
```

## 🔍 Step 5: Monitor AI Agent

### Real-time Monitoring
- **Status Endpoint**: `GET /api/v1/ai-agent/status`
- **Metrics Endpoint**: `GET /api/v1/ai-agent/metrics`
- **Issues Endpoint**: `GET /api/v1/ai-agent/issues`

### Log Monitoring
- Check Render logs for AI agent activity
- Look for issue detection and resolution messages
- Monitor performance metrics

## 🛠️ Step 6: Configure AI Agent (Optional)

### Start/Stop AI Agent
```bash
# Start AI agent
curl -X POST https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/start

# Stop AI agent
curl -X POST https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/stop
```

### Test AI Developer
```bash
# Test with mock database issue
curl -X POST https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/test-developer \
  -H "Content-Type: application/json" \
  -d '{"issueType": "database", "severity": "high"}'
```

## 📈 Step 7: Monitor Performance

### Key Metrics to Watch
- **Issues Detected**: Number of issues found by AI agent
- **Auto-Fixes Applied**: Number of automatic fixes
- **Success Rate**: Percentage of successful resolutions
- **Response Time**: Time taken to resolve issues

### Performance Indicators
- Backend health check response times
- API endpoint availability
- Database connection stability
- Memory and CPU usage

## 🔧 Troubleshooting

### Common Issues

#### AI Agent Not Starting
**Symptoms**: No AI agent logs in deployment
**Solution**: 
1. Check `AI_MONITORING_ENABLED=true` in environment variables
2. Verify `OPENAI_API_KEY` is set correctly
3. Check deployment logs for errors

#### OpenAI API Errors
**Symptoms**: ChatGPT integration failures
**Solution**:
1. Verify OpenAI API key is valid and has credits
2. Check API key permissions
3. Monitor API usage limits

#### Knowledge Base Loading Issues
**Symptoms**: AI agent starts but lacks platform context
**Solution**:
1. Check if documentation files are accessible
2. Verify file permissions
3. Check deployment setup logs

### Debug Commands
```bash
# Check AI agent status
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/status

# Get recent issues
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/issues?limit=10

# Get resolution history
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/resolutions?limit=5

# Test developer capabilities
curl https://clutch-main-nk7x.onrender.com/api/v1/ai-agent/capabilities
```

## 📊 Expected Behavior

### After Successful Deployment
1. **AI Agent Starts**: Automatically starts with backend
2. **Knowledge Base Loads**: Platform documentation is loaded
3. **Health Checks Begin**: Regular monitoring starts every 5 minutes
4. **Issue Detection**: AI agent monitors for problems
5. **Auto-Fixes**: Issues are automatically resolved when possible

### AI Agent Activities
- **Every 5 minutes**: Health checks and monitoring
- **On Issue Detection**: Analysis and resolution attempts
- **On Resolution**: Documentation and learning
- **Continuous**: Performance monitoring and optimization

## 🎯 Success Indicators

### Deployment Success
- ✅ AI agent starts without errors
- ✅ Knowledge base loads successfully
- ✅ Health checks are running
- ✅ API endpoints are accessible

### AI Agent Success
- ✅ Issues are detected automatically
- ✅ Auto-fixes are applied successfully
- ✅ Performance metrics improve
- ✅ System stability increases

## 🔄 Maintenance

### Regular Tasks
1. **Monitor AI Agent Performance**: Check success rates and metrics
2. **Review Resolutions**: Analyze AI agent solutions
3. **Update Documentation**: Keep platform docs current
4. **Optimize Patterns**: Improve issue detection patterns

### Updates
1. **Platform Changes**: Update knowledge base when platform evolves
2. **New Issues**: Add custom issue patterns as needed
3. **Performance Tuning**: Optimize check intervals and thresholds

## 📞 Support

### Logs and Monitoring
- **Render Logs**: Check service logs for AI agent activity
- **API Endpoints**: Use status and metrics endpoints
- **Health Checks**: Monitor backend health continuously

### Documentation
- **API Documentation**: Available at `/api-docs`
- **AI Agent README**: Complete system documentation
- **Platform Knowledge**: Automatically loaded from documentation

---

## 🎉 Deployment Complete!

Your Enterprise AI Developer is now running on Render and will:
- ✅ Automatically monitor your backend
- ✅ Detect and analyze issues
- ✅ Apply intelligent fixes
- ✅ Learn from resolutions
- ✅ Improve system performance

The AI agent will start working immediately after deployment and will continuously monitor and improve your backend system!
