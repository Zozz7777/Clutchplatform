/**
 * Load Balancer Configuration
 */

const loadBalancerConfig = {
  // Server instances
  servers: [
    {
      host: process.env.SERVER1_HOST || 'localhost',
      port: process.env.SERVER1_PORT || 5000,
      weight: 1,
      health: true
    },
    {
      host: process.env.SERVER2_HOST || 'localhost',
      port: process.env.SERVER2_PORT || 5001,
      weight: 1,
      health: true
    }
  ],
  
  // Load balancing algorithm
  algorithm: process.env.LB_ALGORITHM || 'round-robin', // round-robin, least-connections, weighted
  
  // Health check configuration
  healthCheck: {
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    path: '/health',
    expectedStatus: 200
  },
  
  // Session affinity
  sessionAffinity: {
    enabled: true,
    cookieName: 'lb-session',
    maxAge: 3600000 // 1 hour
  },
  
  // Failover configuration
  failover: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    metrics: {
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      activeConnections: 0
    }
  }
};

module.exports = loadBalancerConfig;
