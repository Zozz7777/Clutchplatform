# Backend Connection Guide - Clutch Auto Parts System

This guide explains how the Clutch Auto Parts System connects to the Clutch backend and how to test and troubleshoot these connections.

## Overview

The system uses a comprehensive backend integration architecture that includes:

- **API Manager**: Handles HTTP requests to the Clutch backend
- **WebSocket Manager**: Manages real-time communication
- **Connection Manager**: Monitors and manages all connections
- **Backend Configuration**: Centralized configuration management
- **Endpoint Tester**: Comprehensive testing of all API endpoints
- **Sync Manager**: Handles data synchronization

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Clutch Auto Parts System                │
├─────────────────────────────────────────────────────────────┤
│  Connection Manager                                         │
│  ├── API Manager (HTTP/HTTPS)                              │
│  ├── WebSocket Manager (WSS)                               │
│  ├── Backend Configuration                                  │
│  └── Endpoint Tester                                       │
├─────────────────────────────────────────────────────────────┤
│  Data Sync Manager                                          │
│  ├── Real-time Sync                                        │
│  ├── Offline Queue                                         │
│  └── Conflict Resolution                                   │
├─────────────────────────────────────────────────────────────┤
│  Local Database (SQLite)                                    │
│  ├── Inventory Data                                        │
│  ├── Sales Data                                            │
│  ├── Customer Data                                         │
│  └── Settings                                              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Clutch Backend                           │
│  ├── API Endpoints (REST)                                  │
│  ├── WebSocket Server                                      │
│  ├── AI Services                                           │
│  ├── Market Intelligence                                   │
│  └── Order Management                                      │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Backend Configuration

The system uses `backend-config.js` to manage all backend settings:

```javascript
const backendConfig = require('./backend-config');

// Initialize configuration
await backendConfig.initialize();

// Get connection status
const status = backendConfig.getConnectionStatus();

// Update credentials
await backendConfig.updateCredentials({
    apiKey: 'your-api-key',
    shopId: 'your-shop-id',
    token: 'auth-token'
});
```

### API Endpoints

The system connects to the following endpoint categories:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `GET /auth/verify` - Verify token
- `POST /auth/logout` - User logout

#### Shop Management
- `GET /shops/profile` - Get shop profile
- `PUT /shops/update` - Update shop info
- `GET /shops/settings` - Get shop settings
- `GET /shops/stats` - Get shop statistics

#### Inventory Management
- `GET /inventory/items` - List inventory items
- `POST /inventory/items` - Create inventory item
- `PUT /inventory/items/{id}` - Update inventory item
- `DELETE /inventory/items/{id}` - Delete inventory item
- `POST /inventory/sync` - Sync inventory data
- `GET /inventory/recommendations` - Get recommendations
- `GET /inventory/alerts` - Get inventory alerts

#### Sales Management
- `GET /sales/transactions` - List sales
- `POST /sales/transactions` - Create sale
- `PUT /sales/transactions/{id}` - Update sale
- `POST /sales/sync` - Sync sales data
- `GET /sales/analytics` - Get sales analytics

#### Customer Management
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer
- `GET /customers/analytics` - Get customer analytics

#### Supplier Management
- `GET /suppliers` - List suppliers
- `POST /suppliers` - Create supplier
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier

#### AI Services
- `GET /ai/demand-forecast` - Get demand forecast
- `GET /ai/price-optimization` - Get price optimization
- `GET /ai/inventory-optimization` - Get inventory optimization
- `GET /ai/customer-insights` - Get customer insights
- `GET /ai/market-analysis` - Get market analysis

#### Order Management
- `GET /orders` - List orders
- `GET /orders/{id}` - Get order details
- `POST /orders/{id}/accept` - Accept order
- `POST /orders/{id}/reject` - Reject order
- `POST /orders/{id}/quote` - Submit quote

#### Market Intelligence
- `GET /market/insights` - Get market insights
- `GET /market/trends` - Get market trends
- `GET /market/top-selling` - Get top selling items
- `GET /market/popular-cars` - Get popular car models

#### System
- `GET /system/health` - Health check
- `GET /system/ping` - Ping test
- `GET /system/time` - Get server time
- `GET /system/version` - Get system version

## Testing Backend Connections

### Using the Connection Status Page

1. Open the Clutch Auto Parts System
2. Navigate to "حالة الاتصال" (Connection Status)
3. Click "تحديث الاتصالات" (Refresh Connections) to test all endpoints
4. Review the connection status and any errors

### Using the Command Line Test Script

```bash
# Test all backend connections
npm run test:backend

# Test with verbose output
npm run test:backend:verbose

# Test specific endpoint
node scripts/test-backend-connections.js --endpoint=auth.verify

# Test specific category
node scripts/test-backend-connections.js --category=inventory
```

### Manual Testing

You can also test connections manually using the API manager:

```javascript
const apiManager = require('./api');

// Test API connection
const connected = await apiManager.testConnection();
console.log('API Connected:', connected);

// Test specific endpoint
try {
    const response = await apiManager.makeRequest('GET', '/system/health');
    console.log('Health check:', response);
} catch (error) {
    console.error('Health check failed:', error);
}
```

## Real-time Communication

### WebSocket Connection

The system maintains a persistent WebSocket connection for real-time updates:

```javascript
const websocketManager = require('./websocket-manager');

// Get connection status
const status = websocketManager.getConnectionStatus();
console.log('WebSocket Connected:', status.isConnected);

// Subscribe to events
websocketManager.subscribe('inventory_update', (data) => {
    console.log('Inventory updated:', data);
});

websocketManager.subscribe('new_order', (data) => {
    console.log('New order received:', data);
});
```

### Real-time Events

The system listens for the following real-time events:

- `inventory_update` - Inventory changes
- `price_update` - Price changes
- `demand_forecast` - Demand forecast updates
- `market_insight` - Market insights
- `new_order` - New orders from customers
- `order_update` - Order status updates
- `stock_alert` - Low stock alerts
- `price_alert` - Price change alerts
- `system_message` - System notifications

## Data Synchronization

### Real-time Sync

The system automatically syncs data in real-time:

```javascript
const syncManager = require('./sync-manager');

// Get sync status
const status = syncManager.getStatus();
console.log('Sync Status:', status);

// Force sync
await syncManager.forceSync();

// Start real-time sync
await syncManager.startRealTimeSync();
```

### Offline Support

The system works offline and queues changes for later sync:

- All operations work locally when offline
- Changes are queued in the sync manager
- Automatic sync when connection is restored
- Conflict resolution for conflicting changes

## Troubleshooting

### Common Issues

#### 1. API Connection Failed

**Symptoms:**
- API status shows "Disconnected"
- Error messages in connection log

**Solutions:**
- Check internet connection
- Verify API key and shop ID
- Check if Clutch backend is accessible
- Review firewall settings

#### 2. WebSocket Connection Failed

**Symptoms:**
- WebSocket status shows "Disconnected"
- No real-time updates

**Solutions:**
- Check WebSocket URL configuration
- Verify authentication token
- Check network connectivity
- Review proxy settings

#### 3. Endpoint Testing Failures

**Symptoms:**
- Some endpoints show as failed
- High failure rate in endpoint tests

**Solutions:**
- Check endpoint URLs
- Verify authentication
- Review API permissions
- Check rate limiting

#### 4. Sync Issues

**Symptoms:**
- Data not syncing
- Sync queue growing large
- Conflict errors

**Solutions:**
- Check connection status
- Review sync manager logs
- Clear sync queue if needed
- Check data format compatibility

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Enable debug logging
localStorage.setItem('debug_mode', 'true');

// Check debug logs
const logs = localStorage.getItem('debug_logs');
console.log('Debug logs:', logs);
```

### Connection Logs

View connection logs in the Connection Status page:

1. Navigate to "حالة الاتصال" (Connection Status)
2. Scroll to "سجل الاتصال" (Connection Log)
3. Review recent connection events
4. Export logs if needed for support

## Performance Monitoring

### Connection Statistics

The system tracks connection performance:

- Response times for each endpoint
- Success/failure rates
- Connection uptime
- Sync performance metrics

### Optimization

To optimize connection performance:

1. **Reduce API calls**: Use batch operations when possible
2. **Cache data**: Store frequently accessed data locally
3. **Optimize sync**: Use incremental sync for large datasets
4. **Monitor performance**: Use the Performance page to track metrics

## Security

### Authentication

The system uses secure authentication:

- API keys for service authentication
- JWT tokens for user sessions
- Automatic token refresh
- Secure credential storage

### Data Protection

- All API calls use HTTPS
- WebSocket connections use WSS
- Sensitive data is encrypted
- Local database is protected

## Support

### Getting Help

If you encounter issues with backend connections:

1. Check the Connection Status page
2. Review connection logs
3. Run the backend test script
4. Contact Clutch support with logs

### Log Collection

To collect logs for support:

1. Export connection logs from the Connection Status page
2. Run the backend test script with verbose output
3. Include system information and error messages
4. Provide steps to reproduce the issue

## API Documentation

For detailed API documentation, refer to the Clutch Backend API documentation or contact the development team.

## Updates

The backend connection system is regularly updated. Check for updates:

1. Use the built-in update checker
2. Review the changelog
3. Test connections after updates
4. Report any issues immediately
