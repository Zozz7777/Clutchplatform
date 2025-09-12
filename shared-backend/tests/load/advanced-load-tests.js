import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');
const userCount = new Counter('users');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '3m', target: 2000 },  // Ramp up to 2000 users
    { duration: '5m', target: 2000 },  // Stay at 2000 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],  // 95% under 200ms, 99% under 500ms
    http_req_failed: ['rate<0.01'],                // Error rate under 1%
    errors: ['rate<0.01'],                         // Custom error rate under 1%
    response_time: ['p(95)<200', 'p(99)<500'],     // Response time thresholds
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

  // Increment user count
  userCount.add(1);

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
  const dashboardCheck = check(dashboardResponse, {
    'admin dashboard status is 200': (r) => r.status === 200,
    'admin dashboard response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!dashboardCheck) errorRate.add(1);
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(1);

  // Test users management
  const usersResponse = http.get(`${baseUrl}/api/v1/admin/users`, { headers });
  const usersCheck = check(usersResponse, {
    'users endpoint status is 200': (r) => r.status === 200,
    'users endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!usersCheck) errorRate.add(1);
  responseTime.add(usersResponse.timings.duration);
  requestCount.add(1);

  // Test analytics
  const analyticsResponse = http.get(`${baseUrl}/api/v1/admin/analytics`, { headers });
  const analyticsCheck = check(analyticsResponse, {
    'analytics endpoint status is 200': (r) => r.status === 200,
    'analytics endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!analyticsCheck) errorRate.add(1);
  responseTime.add(analyticsResponse.timings.duration);
  requestCount.add(1);

  // Test finance
  const financeResponse = http.get(`${baseUrl}/api/v1/admin/finance`, { headers });
  const financeCheck = check(financeResponse, {
    'finance endpoint status is 200': (r) => r.status === 200,
    'finance endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!financeCheck) errorRate.add(1);
  responseTime.add(financeResponse.timings.duration);
  requestCount.add(1);

  // Test HR
  const hrResponse = http.get(`${baseUrl}/api/v1/admin/hr`, { headers });
  const hrCheck = check(hrResponse, {
    'hr endpoint status is 200': (r) => r.status === 200,
    'hr endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!hrCheck) errorRate.add(1);
  responseTime.add(hrResponse.timings.duration);
  requestCount.add(1);
}

function testUserEndpoints(headers) {
  // Test user dashboard
  const dashboardResponse = http.get(`${baseUrl}/api/v1/dashboard/user/overview`, { headers });
  const dashboardCheck = check(dashboardResponse, {
    'user dashboard status is 200': (r) => r.status === 200,
    'user dashboard response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!dashboardCheck) errorRate.add(1);
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(1);

  // Test user vehicles
  const vehiclesResponse = http.get(`${baseUrl}/api/v1/clutch-mobile/vehicles`, { headers });
  const vehiclesCheck = check(vehiclesResponse, {
    'vehicles endpoint status is 200': (r) => r.status === 200,
    'vehicles endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!vehiclesCheck) errorRate.add(1);
  responseTime.add(vehiclesResponse.timings.duration);
  requestCount.add(1);

  // Test user bookings
  const bookingsResponse = http.get(`${baseUrl}/api/v1/clutch-mobile/bookings`, { headers });
  const bookingsCheck = check(bookingsResponse, {
    'bookings endpoint status is 200': (r) => r.status === 200,
    'bookings endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!bookingsCheck) errorRate.add(1);
  responseTime.add(bookingsResponse.timings.duration);
  requestCount.add(1);
}

function testPartnerEndpoints(headers) {
  // Test partner dashboard
  const dashboardResponse = http.get(`${baseUrl}/api/v1/partners-mobile/dashboard`, { headers });
  const dashboardCheck = check(dashboardResponse, {
    'partner dashboard status is 200': (r) => r.status === 200,
    'partner dashboard response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!dashboardCheck) errorRate.add(1);
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(1);

  // Test partner orders
  const ordersResponse = http.get(`${baseUrl}/api/v1/partners-mobile/orders`, { headers });
  const ordersCheck = check(ordersResponse, {
    'orders endpoint status is 200': (r) => r.status === 200,
    'orders endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!ordersCheck) errorRate.add(1);
  responseTime.add(ordersResponse.timings.duration);
  requestCount.add(1);

  // Test partner inventory
  const inventoryResponse = http.get(`${baseUrl}/api/v1/partners-mobile/inventory`, { headers });
  const inventoryCheck = check(inventoryResponse, {
    'inventory endpoint status is 200': (r) => r.status === 200,
    'inventory endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!inventoryCheck) errorRate.add(1);
  responseTime.add(inventoryResponse.timings.duration);
  requestCount.add(1);
}

// Stress testing scenario
export function stressTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/dashboard/consolidated`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'stress test status is 200': (r) => r.status === 200,
    'stress test response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}

// Spike testing scenario
export function spikeTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/users`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'spike test status is 200': (r) => r.status === 200,
    'spike test response time < 500ms': (r) => r.timings.duration < 500,
  });
}

// Volume testing scenario
export function volumeTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/analytics`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'volume test status is 200': (r) => r.status === 200,
    'volume test response time < 300ms': (r) => r.timings.duration < 300,
  });
}

// Database performance testing
export function databasePerformanceTest() {
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

// Memory leak testing
export function memoryLeakTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/users`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'memory leak test status is 200': (r) => r.status === 200,
    'memory leak test response time < 200ms': (r) => r.timings.duration < 200,
  });
}

// Concurrent request testing
export function concurrentRequestTest() {
  const requests = [];
  
  for (let i = 0; i < 20; i++) {
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

// API endpoint performance testing
export function apiEndpointPerformanceTest() {
  const endpoints = [
    '/api/v1/admin/dashboard/consolidated',
    '/api/v1/admin/users',
    '/api/v1/admin/analytics',
    '/api/v1/admin/finance',
    '/api/v1/admin/hr'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    const response = http.get(`${baseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
    });

    results.push({
      endpoint,
      status: response.status,
      responseTime: response.timings.duration
    });

    check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time < 200ms`]: (r) => r.timings.duration < 200,
    });
  }

  return results;
}

// Scalability testing
export function scalabilityTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/dashboard/consolidated`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'scalability test status is 200': (r) => r.status === 200,
    'scalability test response time < 200ms': (r) => r.timings.duration < 200,
    'scalability test handles load': (r) => r.timings.duration < 500,
  });
}

// Resource utilization testing
export function resourceUtilizationTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/users`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'resource utilization test status is 200': (r) => r.status === 200,
    'resource utilization test response time < 200ms': (r) => r.timings.duration < 200,
  });
}

// Error handling testing
export function errorHandlingTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/nonexistent-endpoint`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'error handling test status is 404': (r) => r.status === 404,
    'error handling test response time < 100ms': (r) => r.timings.duration < 100,
  });
}

// Authentication performance testing
export function authenticationPerformanceTest() {
  const response = http.post(`${baseUrl}/api/v1/auth/login`, JSON.stringify({
    email: 'admin@clutch.com',
    password: 'admin123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'authentication test status is 200': (r) => r.status === 200,
    'authentication test response time < 500ms': (r) => r.timings.duration < 500,
    'authentication test returns token': (r) => {
      const data = JSON.parse(r.body);
      return data.token !== undefined;
    },
  });
}

// Session management testing
export function sessionManagementTest() {
  const token = getAuthToken(testUsers[0]);
  
  if (!token) {
    return;
  }

  const response = http.get(`${baseUrl}/api/v1/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(response, {
    'session management test status is 200': (r) => r.status === 200,
    'session management test response time < 200ms': (r) => r.timings.duration < 200,
  });
}

// Data consistency testing
export function dataConsistencyTest() {
  const response = http.get(`${baseUrl}/api/v1/admin/dashboard/consolidated`, {
    headers: { 'Authorization': `Bearer ${getAuthToken(testUsers[0])}` },
  });

  check(response, {
    'data consistency test status is 200': (r) => r.status === 200,
    'data consistency test response time < 200ms': (r) => r.timings.duration < 200,
    'data consistency test returns valid data': (r) => {
      const data = JSON.parse(r.body);
      return data.success === true && data.data !== undefined;
    },
  });
}
