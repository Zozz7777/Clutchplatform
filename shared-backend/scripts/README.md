# Keep-Alive Service Documentation

## Overview

The Clutch Backend includes a keep-alive service to prevent the Render free tier from spinning down due to inactivity. This service periodically pings the health endpoint to maintain activity.

## How It Works

### Internal Keep-Alive Service
- **Location**: Integrated into `server.js`
- **Trigger**: Automatically starts when `NODE_ENV=production` or `ENABLE_KEEP_ALIVE=true`
- **Interval**: 14 minutes (just under the 15-minute Render timeout)
- **Endpoint**: `/health/ping` (lightweight endpoint)
- **Logging**: Console logs with timestamps

### External Keep-Alive Script
- **Location**: `scripts/keep-alive.js`
- **Usage**: Can be run externally as a backup
- **Configurable**: Environment variables for URL and interval

## Configuration

### Environment Variables

```bash
# Enable keep-alive service
ENABLE_KEEP_ALIVE=true

# Custom keep-alive URL (optional)
KEEP_ALIVE_URL=https://clutch-main-nk7x.onrender.com/health/ping

# Custom interval in minutes (optional, default: 14)
INTERVAL=14
```

### Health Endpoints

1. **Lightweight Ping**: `/health/ping`
   - Minimal response
   - Used by keep-alive service
   - Returns: `{ "success": true, "data": { "status": "pong", "timestamp": "...", "uptime": ... } }`

2. **Full Health Check**: `/health`
   - Complete health status
   - Used for monitoring
   - Returns: Detailed health information

3. **Database Health**: `/health/database`
   - Database connectivity check
   - Returns: Database connection status

4. **Detailed Health**: `/health/detailed`
   - Comprehensive system check
   - Returns: All system components status

## Usage

### Automatic (Recommended)
The keep-alive service starts automatically in production environments.

### Manual External Script
```bash
# Run with default settings
node scripts/keep-alive.js

# Run with custom URL
KEEP_ALIVE_URL=https://your-app.onrender.com/health/ping node scripts/keep-alive.js

# Run with custom interval (10 minutes)
INTERVAL=10 node scripts/keep-alive.js
```

### Cron Job (Alternative)
```bash
# Add to crontab to run every 14 minutes
*/14 * * * * curl -s https://clutch-main-nk7x.onrender.com/health/ping > /dev/null
```

## Monitoring

### Console Logs
The service logs all ping attempts:
```
✅ Keep-alive ping successful at 2025-08-31T09:15:00.000Z
⚠️ Keep-alive ping returned status 500 at 2025-08-31T09:29:00.000Z
❌ Keep-alive ping failed at 2025-08-31T09:43:00.000Z: connect ECONNREFUSED
```

### Health Check Response
```json
{
  "success": true,
  "data": {
    "status": "pong",
    "timestamp": "2025-08-31T09:15:00.000Z",
    "uptime": 3600.123
  }
}
```

## Benefits

1. **Prevents Cold Starts**: Keeps the service warm
2. **Faster Response Times**: No 15+ second startup delays
3. **Better User Experience**: Immediate API responses
4. **Cost Effective**: Minimal resource usage
5. **Reliable**: Multiple fallback options

## Troubleshooting

### Service Not Starting
- Check `ENABLE_KEEP_ALIVE` environment variable
- Verify `NODE_ENV` is set to `production`
- Check console logs for errors

### Ping Failures
- Verify the health endpoint is accessible
- Check network connectivity
- Review server logs for errors

### High Resource Usage
- The service uses minimal resources
- Each ping is lightweight and fast
- No database queries in ping endpoint

## Security

- Uses standard HTTP/HTTPS requests
- Includes custom headers for identification
- No sensitive data transmitted
- Timeout protection (10 seconds)
- Error handling and logging
