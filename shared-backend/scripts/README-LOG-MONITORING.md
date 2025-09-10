# Automated Log Monitoring System

This system provides automated log monitoring for both backend and frontend applications, eliminating the need for manual copy-pasting of console errors.

## Features

### 🔧 Backend Log Monitoring
- **Render API Integration**: Automatically fetches logs from Render services
- **Real-time Monitoring**: Continuous polling of service logs
- **Error Classification**: Categorizes logs by severity and type
- **Service Health**: Monitors health status of all services

### 🌐 Frontend Error Tracking
- **Automatic Error Capture**: Captures all console errors, warnings, and exceptions
- **Unhandled Promise Rejections**: Tracks unhandled promise rejections
- **Network Error Monitoring**: Monitors failed API requests and network issues
- **Performance Monitoring**: Tracks long tasks and memory usage
- **User Context**: Associates errors with user sessions and IDs

### 📊 Unified Dashboard
- **Real-time Error Display**: Live view of all application errors
- **Error Statistics**: Comprehensive error analytics and trends
- **Severity Classification**: Critical, High, Medium, Low error categorization
- **Auto-refresh**: Automatic updates without manual intervention

## Setup Instructions

### 1. Get Your Render API Key

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your account settings
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key

### 2. Set Environment Variables

```bash
# Required
export RENDER_API_KEY="your-render-api-key-here"

# Optional (will be auto-discovered)
export RENDER_OWNER_ID="your-owner-id"
```

### 3. Initialize the System

```bash
# Navigate to backend directory
cd shared-backend

# Run setup script
npm run logs:setup
```

### 4. Start Monitoring

```bash
# Start comprehensive monitoring (recommended)
npm run logs:comprehensive

# Or start individual monitoring
npm run logs:monitor
```

## Usage

### Command Line Monitoring

```bash
# Start comprehensive monitoring
npm run logs:comprehensive

# Check service health
npm run logs:health

# Export logs to file
npm run logs:export

# Setup/configure monitoring
npm run logs:setup
```

### Frontend Integration

The frontend error tracking is automatically enabled when you visit `admin.yourclutch.com`. It will:

1. **Capture Console Errors**: All `console.error()`, `console.warn()` calls
2. **Track Unhandled Exceptions**: JavaScript errors and unhandled promise rejections
3. **Monitor Network Issues**: Failed API requests and network errors
4. **Send to Backend**: Automatically sends errors to the backend for storage

### Viewing Errors

#### Option 1: Command Line (Real-time)
```bash
npm run logs:comprehensive
```

#### Option 2: Web Dashboard
1. Visit `admin.yourclutch.com`
2. Navigate to the Log Dashboard (if available in your admin interface)
3. View real-time error statistics and details

#### Option 3: API Endpoints
```bash
# Get recent frontend errors
curl "https://clutch-main-nk7x.onrender.com/api/v1/errors/frontend?limit=50"

# Get error statistics
curl "https://clutch-main-nk7x.onrender.com/api/v1/errors/frontend/stats?days=7"
```

## Error Types Tracked

### Frontend Errors
- **Console Errors**: `console.error()` calls
- **Console Warnings**: `console.warn()` calls
- **Unhandled Exceptions**: JavaScript runtime errors
- **Unhandled Promise Rejections**: Failed async operations
- **Network Errors**: Failed HTTP requests
- **Performance Issues**: Long tasks and memory usage

### Backend Logs
- **Application Logs**: All server-side logging
- **Error Logs**: Server errors and exceptions
- **Access Logs**: HTTP request/response logs
- **Database Logs**: Database operation logs

## Error Severity Levels

- **🚨 Critical**: System-breaking errors that require immediate attention
- **🔴 High**: Important errors that affect functionality
- **🟡 Medium**: Warnings and non-critical issues
- **🔵 Low**: Informational messages and minor issues

## Configuration

### Log Monitor Configuration
Edit `shared-backend/scripts/log-monitor-config.json`:

```json
{
  "monitoring": {
    "pollInterval": 30000,
    "maxLogs": 1000,
    "logLevel": "info"
  },
  "filters": {
    "includeLevels": ["error", "warn", "info"],
    "excludePatterns": ["health check", "ping", "favicon"]
  }
}
```

### Frontend Error Tracker Configuration
Edit `clutch-admin/src/utils/errorTracker.ts`:

```typescript
const errorTracker = new ErrorTracker({
  apiEndpoint: '/api/v1/errors/frontend',
  batchSize: 10,
  flushInterval: 5000,
  enableConsoleCapture: true,
  enableUnhandledRejection: true,
  enableNetworkErrors: true
});
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your Render API key is correct
   - Check that the key has proper permissions
   - Ensure the key is set in environment variables

2. **No Logs Appearing**
   - Check if services are running on Render
   - Verify service IDs in configuration
   - Check network connectivity

3. **Frontend Errors Not Captured**
   - Ensure error tracker is initialized in the app
   - Check browser console for error tracker messages
   - Verify API endpoint is accessible

4. **High Memory Usage**
   - Reduce `maxLogs` in configuration
   - Increase `flushInterval` to reduce frequency
   - Enable log cleanup with `npm run logs:cleanup`

### Debug Mode

Enable debug logging:

```bash
DEBUG=log-monitor npm run logs:comprehensive
```

## API Endpoints

### Frontend Error Endpoints

- `POST /api/v1/errors/frontend` - Store frontend errors
- `GET /api/v1/errors/frontend` - Retrieve frontend errors
- `GET /api/v1/errors/frontend/stats` - Get error statistics
- `GET /api/v1/errors/frontend/stream` - Real-time error stream
- `DELETE /api/v1/errors/frontend/cleanup` - Cleanup old errors

### Example API Usage

```bash
# Get recent errors
curl "https://your-backend-url.com/api/v1/errors/frontend?limit=10&severity=critical"

# Get error statistics for last 7 days
curl "https://your-backend-url.com/api/v1/errors/frontend/stats?days=7"

# Cleanup errors older than 30 days
curl -X DELETE "https://your-backend-url.com/api/v1/errors/frontend/cleanup?days=30"
```

## Benefits

✅ **No More Manual Copy-Pasting**: Errors are automatically captured and stored
✅ **Real-time Monitoring**: See errors as they happen
✅ **Comprehensive Coverage**: Both frontend and backend error tracking
✅ **Historical Data**: Store and analyze error trends over time
✅ **User Context**: Associate errors with specific users and sessions
✅ **Performance Insights**: Track performance-related issues
✅ **Centralized Logging**: All logs in one place for easy analysis

## Support

If you encounter any issues with the log monitoring system:

1. Check the troubleshooting section above
2. Review the console output for error messages
3. Verify your Render API key and permissions
4. Ensure all environment variables are set correctly

The system is designed to be robust and self-healing, but manual intervention may be required for initial setup or configuration changes.
