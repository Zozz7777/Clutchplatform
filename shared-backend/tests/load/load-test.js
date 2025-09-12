import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
    errors: ['rate<0.01'],             // Custom error rate under 1%
  },
};

// Test data
const testUsers = [
  { email: 'admin@clutch.com', password: 'admin123', role: 'admin' },
  { email: 'user@clutch.com', password: 'user123', role: 'user' },
  { email: 'partner@clutch.com', password: 'partner123', role: 'partner' },
];

const baseUrl = __ENV.BASE_URL || 'http://localhost:5000';

// Helper function to get auth token
function getAuthToken(user) {
  const loginResponse = http.post(`${baseUrl}/api/v1/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginResponse.status === 200) {
    const loginData = JSON.parse(loginResponse.body);
    return loginData.token;
  }
  return null;
}

// Main test function
export default function () {
  // Select random user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Get authentication token
  const token = getAuthToken(user);
  
  if (!token) {
    errorRate.add(1);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test different endpoints based on user role
  if (user.role === 'admin') {
    testAdminEndpoints(headers);
  } else if (user.role === 'user') {
    testUserEndpoints(headers);
  } else if (user.role === 'partner') {
    testPartnerEndpoints(headers);
  }

  sleep(1);
}

function testAdminEndpoints(headers) {
  // Test admin dashboard
  const dashboardResponse = http.get(`${baseUrl}/api/v1/admin/dashboard/consolidated`, { headers });
  check(dashboardResponse, {
    'admin dashboard status is 200': (r) => r.status === 200,
    'admin dashboard response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test users management
  const usersResponse = http.get(`${baseUrl}/api/v1/admin/users`, { headers });
  check(usersResponse, {
    'users endpoint status is 200': (r) => r.status === 200,
    'users endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test analytics
  const analyticsResponse = http.get(`${baseUrl}/api/v1/admin/analytics`, { headers });
  check(analyticsResponse, {
    'analytics endpoint status is 200': (r) => r.status === 200,
    'analytics endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test finance
  const financeResponse = http.get(`${baseUrl}/api/v1/admin/finance`, { headers });
  check(financeResponse, {
    'finance endpoint status is 200': (r) => r.status === 200,
    'finance endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test HR
  const hrResponse = http.get(`${baseUrl}/api/v1/admin/hr`, { headers });
  check(hrResponse, {
    'hr endpoint status is 200': (r) => r.status === 200,
    'hr endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);
}

function testUserEndpoints(headers) {
  // Test user dashboard
  const dashboardResponse = http.get(`${baseUrl}/api/v1/dashboard/user/overview`, { headers });
  check(dashboardResponse, {
    'user dashboard status is 200': (r) => r.status === 200,
    'user dashboard response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test user vehicles
  const vehiclesResponse = http.get(`${baseUrl}/api/v1/clutch-mobile/vehicles`, { headers });
  check(vehiclesResponse, {
    'vehicles endpoint status is 200': (r) => r.status === 200,
    'vehicles endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test user bookings
  const bookingsResponse = http.get(`${baseUrl}/api/v1/clutch-mobile/bookings`, { headers });
  check(bookingsResponse, {
    'bookings endpoint status is 200': (r) => r.status === 200,
    'bookings endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);
}

function testPartnerEndpoints(headers) {
  // Test partner dashboard
  const dashboardResponse = http.get(`${baseUrl}/api/v1/partners-mobile/dashboard`, { headers });
  check(dashboardResponse, {
    'partner dashboard status is 200': (r) => r.status === 200,
    'partner dashboard response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test partner orders
  const ordersResponse = http.get(`${baseUrl}/api/v1/partners-mobile/orders`, { headers });
  check(ordersResponse, {
    'orders endpoint status is 200': (r) => r.status === 200,
    'orders endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test partner inventory
  const inventoryResponse = http.get(`${baseUrl}/api/v1/partners-mobile/inventory`, { headers });
  check(inventoryResponse, {
    'inventory endpoint status is 200': (r) => r.status === 200,
    'inventory endpoint response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);
}

// Test health check endpoint
export function testHealthCheck() {
  const response = http.get(`${baseUrl}/health-enhanced`);
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
}

// Test authentication endpoints
export function testAuthentication() {
  const loginResponse = http.post(`${baseUrl}/api/v1/auth/login`, JSON.stringify({
    email: 'admin@clutch.com',
    password: 'admin123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login returns token': (r) => {
      const data = JSON.parse(r.body);
      return data.token !== undefined;
    },
  });
}

// Test database performance
export function testDatabasePerformance() {
  const response = http.get(`${baseUrl}/api/v1/admin/dashboard/consolidated`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'database query time < 100ms': (r) => r.timings.duration < 100,
    'database response is valid': (r) => {
      const data = JSON.parse(r.body);
      return data.success === true;
    },
  });
}

// Test concurrent requests
export function testConcurrentRequests() {
  const requests = [];
  
  for (let i = 0; i < 10; i++) {
    requests.push({
      method: 'GET',
      url: `${baseUrl}/api/v1/admin/users`,
      headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
    });
  }

  const responses = http.batch(requests);
  
  check(responses, {
    'all concurrent requests successful': (r) => r.every(res => res.status === 200),
    'concurrent requests response time < 500ms': (r) => r.every(res => res.timings.duration < 500),
  });
}
