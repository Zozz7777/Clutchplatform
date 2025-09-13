/**
 * Test Real Endpoints Only
 * Test only endpoints that actually exist in our server
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Real Endpoints Only');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🌐 Testing against: https://clutch-main-nk7x.onrender.com');
console.log('='.repeat(60));

const baseUrl = 'clutch-main-nk7x.onrender.com';
const results = {
  total: 0,
  successful: 0,
  failed: 0,
  errors: {
    400: [],
    401: [],
    403: [],
    404: [],
    500: [],
    other: []
  },
  successEndpoints: []
};

// Real endpoints that should exist based on our route files
const realEndpoints = [
  // Root and Health
  { path: '/', method: 'GET', name: 'Root', requiresAuth: false, body: null },
  { path: '/health', method: 'GET', name: 'Health Check', requiresAuth: false, body: null },
  { path: '/health/ping', method: 'GET', name: 'Health Ping', requiresAuth: false, body: null },
  { path: '/ping', method: 'GET', name: 'Ping', requiresAuth: false, body: null },
  
  // Auth endpoints
  { path: '/api/v1/auth/login', method: 'POST', name: 'Auth Login', requiresAuth: false, body: JSON.stringify({ email: 'test@example.com', password: 'testpassword' }) },
  { path: '/api/v1/auth/register', method: 'POST', name: 'Auth Register', requiresAuth: false, body: JSON.stringify({ email: 'test@example.com', password: 'testpassword', firstName: 'Test', lastName: 'User' }) },
  { path: '/api/v1/auth/logout', method: 'POST', name: 'Auth Logout', requiresAuth: true, body: null },
  { path: '/api/v1/auth/refresh', method: 'POST', name: 'Auth Refresh', requiresAuth: true, body: null },
  { path: '/api/v1/auth/forgot-password', method: 'POST', name: 'Forgot Password', requiresAuth: false, body: JSON.stringify({ email: 'test@example.com' }) },
  { path: '/api/v1/auth/reset-password', method: 'POST', name: 'Reset Password', requiresAuth: false, body: JSON.stringify({ token: 'test-token', password: 'newpassword' }) },
  
  // User management
  { path: '/api/v1/users', method: 'GET', name: 'Users List', requiresAuth: true, body: null },
  { path: '/api/v1/users/1', method: 'GET', name: 'User by ID', requiresAuth: true, body: null },
  { path: '/api/v1/users/profile', method: 'GET', name: 'User Profile', requiresAuth: true, body: null },
  { path: '/api/v1/users/profile', method: 'PUT', name: 'Update Profile', requiresAuth: true, body: JSON.stringify({ name: 'Updated Name' }) },
  { path: '/api/v1/users/1', method: 'PUT', name: 'Update User', requiresAuth: true, body: JSON.stringify({ name: 'Updated User' }) },
  { path: '/api/v1/users/1', method: 'DELETE', name: 'Delete User', requiresAuth: true, body: null },
  
  // Fleet management
  { path: '/api/v1/fleet/vehicles', method: 'GET', name: 'Fleet Vehicles', requiresAuth: true, body: null },
  { path: '/api/v1/fleet/vehicles/1', method: 'GET', name: 'Vehicle by ID', requiresAuth: true, body: null },
  { path: '/api/v1/fleet/vehicles', method: 'POST', name: 'Add Vehicle', requiresAuth: true, body: JSON.stringify({ make: 'Toyota', model: 'Camry', year: 2023 }) },
  { path: '/api/v1/fleet/vehicles/1', method: 'PUT', name: 'Update Vehicle', requiresAuth: true, body: JSON.stringify({ make: 'Honda', model: 'Accord' }) },
  { path: '/api/v1/fleet/vehicles/1', method: 'DELETE', name: 'Delete Vehicle', requiresAuth: true, body: null },
  { path: '/api/v1/fleet/drivers', method: 'GET', name: 'Fleet Drivers', requiresAuth: true, body: null },
  { path: '/api/v1/fleet/drivers/1', method: 'GET', name: 'Driver by ID', requiresAuth: true, body: null },
  { path: '/api/v1/fleet/drivers', method: 'POST', name: 'Add Driver', requiresAuth: true, body: JSON.stringify({ name: 'John Doe', license: 'DL123456' }) },
  { path: '/api/v1/fleet/drivers/1', method: 'PUT', name: 'Update Driver', requiresAuth: true, body: JSON.stringify({ name: 'Jane Doe' }) },
  { path: '/api/v1/fleet/drivers/1', method: 'DELETE', name: 'Delete Driver', requiresAuth: true, body: null },
  
  // Bookings
  { path: '/api/v1/bookings', method: 'GET', name: 'Bookings List', requiresAuth: true, body: null },
  { path: '/api/v1/bookings/1', method: 'GET', name: 'Booking by ID', requiresAuth: true, body: null },
  { path: '/api/v1/bookings', method: 'POST', name: 'Create Booking', requiresAuth: true, body: JSON.stringify({ service: 'Oil Change', date: '2024-01-15' }) },
  { path: '/api/v1/bookings/1', method: 'PUT', name: 'Update Booking', requiresAuth: true, body: JSON.stringify({ service: 'Brake Service' }) },
  { path: '/api/v1/bookings/1', method: 'DELETE', name: 'Cancel Booking', requiresAuth: true, body: null },
  
  // Payments
  { path: '/api/v1/payments', method: 'GET', name: 'Payments List', requiresAuth: true, body: null },
  { path: '/api/v1/payments/1', method: 'GET', name: 'Payment by ID', requiresAuth: true, body: null },
  { path: '/api/v1/payments', method: 'POST', name: 'Process Payment', requiresAuth: true, body: JSON.stringify({ amount: 100, method: 'credit_card' }) },
  { path: '/api/v1/payments/1', method: 'PUT', name: 'Update Payment', requiresAuth: true, body: JSON.stringify({ status: 'completed' }) },
  { path: '/api/v1/payments/1', method: 'DELETE', name: 'Refund Payment', requiresAuth: true, body: null },
  
  // Communication
  { path: '/api/v1/communication/chat', method: 'GET', name: 'Chat Messages', requiresAuth: true, body: null },
  { path: '/api/v1/communication/chat', method: 'POST', name: 'Send Message', requiresAuth: true, body: JSON.stringify({ message: 'Hello', roomId: 'room1' }) },
  { path: '/api/v1/communication/notifications', method: 'GET', name: 'Notifications', requiresAuth: true, body: null },
  { path: '/api/v1/communication/notifications/1', method: 'PUT', name: 'Mark Notification Read', requiresAuth: true, body: null },
  
  // Admin
  { path: '/api/v1/admin/users', method: 'GET', name: 'Admin Users', requiresAuth: true, body: null },
  { path: '/api/v1/admin/users/1', method: 'GET', name: 'Admin User by ID', requiresAuth: true, body: null },
  { path: '/api/v1/admin/dashboard', method: 'GET', name: 'Admin Dashboard', requiresAuth: true, body: null },
  { path: '/api/v1/admin/stats', method: 'GET', name: 'Admin Stats', requiresAuth: true, body: null },
  
  // Performance and Monitoring
  { path: '/api/v1/performance/monitor', method: 'GET', name: 'Performance Monitor', requiresAuth: true, body: null },
  { path: '/api/v1/performance/metrics', method: 'GET', name: 'Performance Metrics', requiresAuth: true, body: null },
  { path: '/api/v1/performance/health', method: 'GET', name: 'Performance Health', requiresAuth: true, body: null },
  
  // Analytics
  { path: '/api/v1/analytics/dashboard', method: 'GET', name: 'Analytics Dashboard', requiresAuth: true, body: null },
  { path: '/api/v1/analytics/reports', method: 'GET', name: 'Analytics Reports', requiresAuth: true, body: null },
  { path: '/api/v1/analytics/metrics', method: 'GET', name: 'Analytics Metrics', requiresAuth: true, body: null },
  
  // Services
  { path: '/api/v1/services', method: 'GET', name: 'Services List', requiresAuth: true, body: null },
  { path: '/api/v1/services/1', method: 'GET', name: 'Service by ID', requiresAuth: true, body: null },
  { path: '/api/v1/services', method: 'POST', name: 'Create Service', requiresAuth: true, body: JSON.stringify({ name: 'Oil Change', price: 50 }) },
  { path: '/api/v1/services/1', method: 'PUT', name: 'Update Service', requiresAuth: true, body: JSON.stringify({ name: 'Premium Oil Change', price: 75 }) },
  { path: '/api/v1/services/1', method: 'DELETE', name: 'Delete Service', requiresAuth: true, body: null },
  
  // Products
  { path: '/api/v1/products', method: 'GET', name: 'Products List', requiresAuth: true, body: null },
  { path: '/api/v1/products/1', method: 'GET', name: 'Product by ID', requiresAuth: true, body: null },
  { path: '/api/v1/products', method: 'POST', name: 'Create Product', requiresAuth: true, body: JSON.stringify({ name: 'Brake Pads', price: 120 }) },
  { path: '/api/v1/products/1', method: 'PUT', name: 'Update Product', requiresAuth: true, body: JSON.stringify({ name: 'Premium Brake Pads', price: 150 }) },
  { path: '/api/v1/products/1', method: 'DELETE', name: 'Delete Product', requiresAuth: true, body: null },
  
  // Orders
  { path: '/api/v1/orders', method: 'GET', name: 'Orders List', requiresAuth: true, body: null },
  { path: '/api/v1/orders/1', method: 'GET', name: 'Order by ID', requiresAuth: true, body: null },
  { path: '/api/v1/orders', method: 'POST', name: 'Create Order', requiresAuth: true, body: JSON.stringify({ items: [{ productId: 1, quantity: 2 }] }) },
  { path: '/api/v1/orders/1', method: 'PUT', name: 'Update Order', requiresAuth: true, body: JSON.stringify({ status: 'shipped' }) },
  { path: '/api/v1/orders/1', method: 'DELETE', name: 'Cancel Order', requiresAuth: true, body: null },
  
  // Inventory
  { path: '/api/v1/inventory', method: 'GET', name: 'Inventory List', requiresAuth: true, body: null },
  { path: '/api/v1/inventory/1', method: 'GET', name: 'Inventory Item by ID', requiresAuth: true, body: null },
  { path: '/api/v1/inventory', method: 'POST', name: 'Add Inventory Item', requiresAuth: true, body: JSON.stringify({ productId: 1, quantity: 100 }) },
  { path: '/api/v1/inventory/1', method: 'PUT', name: 'Update Inventory', requiresAuth: true, body: JSON.stringify({ quantity: 150 }) },
  { path: '/api/v1/inventory/1', method: 'DELETE', name: 'Remove Inventory Item', requiresAuth: true, body: null },
  
  // Customers
  { path: '/api/v1/customers', method: 'GET', name: 'Customers List', requiresAuth: true, body: null },
  { path: '/api/v1/customers/1', method: 'GET', name: 'Customer by ID', requiresAuth: true, body: null },
  { path: '/api/v1/customers', method: 'POST', name: 'Add Customer', requiresAuth: true, body: JSON.stringify({ name: 'John Smith', email: 'john@example.com' }) },
  { path: '/api/v1/customers/1', method: 'PUT', name: 'Update Customer', requiresAuth: true, body: JSON.stringify({ name: 'John Doe' }) },
  { path: '/api/v1/customers/1', method: 'DELETE', name: 'Delete Customer', requiresAuth: true, body: null },
  
  // Reports
  { path: '/api/v1/reports/sales', method: 'GET', name: 'Sales Report', requiresAuth: true, body: null },
  { path: '/api/v1/reports/inventory', method: 'GET', name: 'Inventory Report', requiresAuth: true, body: null },
  { path: '/api/v1/reports/customers', method: 'GET', name: 'Customers Report', requiresAuth: true, body: null },
  { path: '/api/v1/reports/financial', method: 'GET', name: 'Financial Report', requiresAuth: true, body: null },
  
  // Settings
  { path: '/api/v1/settings', method: 'GET', name: 'Settings', requiresAuth: true, body: null },
  { path: '/api/v1/settings', method: 'PUT', name: 'Update Settings', requiresAuth: true, body: JSON.stringify({ theme: 'dark' }) },
  { path: '/api/v1/settings/notifications', method: 'GET', name: 'Notification Settings', requiresAuth: true, body: null },
  { path: '/api/v1/settings/notifications', method: 'PUT', name: 'Update Notification Settings', requiresAuth: true, body: JSON.stringify({ email: true, sms: false }) },
  
  // Search endpoints
  { path: '/api/v1/search', method: 'GET', name: 'Global Search', requiresAuth: true, body: null },
  { path: '/api/v1/search/users', method: 'GET', name: 'Search Users', requiresAuth: true, body: null },
  { path: '/api/v1/search/products', method: 'GET', name: 'Search Products', requiresAuth: true, body: null },
  { path: '/api/v1/search/orders', method: 'GET', name: 'Search Orders', requiresAuth: true, body: null },
  
  // File upload
  { path: '/api/v1/upload', method: 'POST', name: 'File Upload', requiresAuth: true, body: JSON.stringify({ file: 'test-file.txt' }) },
  { path: '/api/v1/upload/images', method: 'POST', name: 'Image Upload', requiresAuth: true, body: JSON.stringify({ image: 'test-image.jpg' }) },
  
  // System endpoints
  { path: '/api/v1/system/info', method: 'GET', name: 'System Info', requiresAuth: true, body: null },
  { path: '/api/v1/system/status', method: 'GET', name: 'System Status', requiresAuth: true, body: null },
  { path: '/api/v1/system/logs', method: 'GET', name: 'System Logs', requiresAuth: true, body: null },
  { path: '/api/v1/system/restart', method: 'POST', name: 'System Restart', requiresAuth: true, body: null },
  
  // Mobile app endpoints
  { path: '/api/v1/mobile/version', method: 'GET', name: 'Mobile Version', requiresAuth: false, body: null },
  { path: '/api/v1/mobile/config', method: 'GET', name: 'Mobile Config', requiresAuth: false, body: null },
  { path: '/api/v1/mobile/sync', method: 'POST', name: 'Mobile Sync', requiresAuth: true, body: JSON.stringify({ lastSync: '2024-01-01T00:00:00Z' }) },
  
  // Webhook endpoints
  { path: '/api/v1/webhooks/payment', method: 'POST', name: 'Payment Webhook', requiresAuth: false, body: JSON.stringify({ event: 'payment.completed' }) },
  { path: '/api/v1/webhooks/notification', method: 'POST', name: 'Notification Webhook', requiresAuth: false, body: JSON.stringify({ event: 'notification.sent' }) }
];

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Real-Endpoint-Test/1.0'
      },
      timeout: 10000
    };

    if (endpoint.body) {
      options.headers['Content-Length'] = Buffer.byteLength(endpoint.body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        const isExpectedAuthError = endpoint.requiresAuth && res.statusCode === 401;
        
        if (isSuccess || isExpectedAuthError) {
          results.successful++;
          results.successEndpoints.push({
            endpoint: `${endpoint.method} ${endpoint.path}`,
            status: res.statusCode,
            name: endpoint.name
          });
        } else {
          results.failed++;
          const errorKey = res.statusCode.toString();
          if (results.errors[errorKey]) {
            results.errors[errorKey].push({
              endpoint: `${endpoint.method} ${endpoint.path}`,
              status: res.statusCode,
              name: endpoint.name
            });
          } else {
            results.errors.other.push({
              endpoint: `${endpoint.method} ${endpoint.path}`,
              status: res.statusCode,
              name: endpoint.name
            });
          }
        }
        
        results.total++;
        resolve();
      });
    });

    req.on('error', (error) => {
      results.failed++;
      results.errors.other.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: 'ERROR',
        name: endpoint.name,
        error: error.message
      });
      results.total++;
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      results.failed++;
      results.errors.other.push({
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: 'TIMEOUT',
        name: endpoint.name
      });
      results.total++;
      resolve();
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }
    
    req.end();
  });
}

async function testRealEndpoints() {
  console.log(`\n🔄 Testing ${realEndpoints.length} real endpoints...\n`);
  
  // Test in batches to avoid overwhelming the server
  const batchSize = 20;
  for (let i = 0; i < realEndpoints.length; i += batchSize) {
    const batch = realEndpoints.slice(i, i + batchSize);
    const promises = batch.map(endpoint => makeRequest(endpoint));
    
    await Promise.all(promises);
    
    const progress = Math.min(i + batchSize, realEndpoints.length);
    const percentage = ((progress / realEndpoints.length) * 100).toFixed(1);
    console.log(`📊 Progress: ${progress}/${realEndpoints.length} (${percentage}%)`);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Generate comprehensive report
  console.log('\n' + '='.repeat(60));
  console.log('🎯 REAL ENDPOINT TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Total Endpoints: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.successful / results.total) * 100).toFixed(2)}%`);
  
  // Error breakdown
  console.log('\n📋 ERROR BREAKDOWN:');
  Object.entries(results.errors).forEach(([status, errors]) => {
    if (errors.length > 0) {
      console.log(`   ${status}: ${errors.length} endpoints`);
    }
  });
  
  // Show failed endpoints for each error type
  console.log('\n❌ FAILED ENDPOINTS:');
  Object.entries(results.errors).forEach(([status, errors]) => {
    if (errors.length > 0) {
      console.log(`\n   ${status} Errors (${errors.length} total):`);
      errors.forEach(error => {
        console.log(`     - ${error.endpoint} (${error.name})`);
      });
    }
  });
  
  // Show successful endpoints
  console.log('\n✅ SUCCESSFUL ENDPOINTS:');
  results.successEndpoints.forEach(success => {
    console.log(`   - ${success.endpoint} (${success.name}) - Status: ${success.status}`);
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, `real-endpoint-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      successful: results.successful,
      failed: results.failed,
      successRate: ((results.successful / results.total) * 100).toFixed(2) + '%'
    },
    errors: results.errors,
    successful: results.successEndpoints
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log('\n🏁 Real endpoint testing complete!');
}

// Start testing
testRealEndpoints().catch(console.error);
