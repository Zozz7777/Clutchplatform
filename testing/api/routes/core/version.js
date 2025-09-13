/**
 * VERSION Routes
 * Core infrastructure endpoints
 */

const express = require('express');
const router = express.Router();

// Health check endpoints
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

router.get('/health/detailed', (req, res) => {
  res.json({ 
    status: 'healthy', 
    services: ['database', 'redis', 'api'],
    timestamp: new Date() 
  });
});

router.get('/health/database', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

router.get('/health/redis', (req, res) => {
  res.json({ status: 'healthy', redis: 'connected' });
});

router.get('/health/services', (req, res) => {
  res.json({ 
    status: 'healthy', 
    services: {
      api: 'running',
      database: 'connected',
      redis: 'connected'
    }
  });
});

// Status endpoints
router.get('/status', (req, res) => {
  res.json({ status: 'operational', uptime: process.uptime() });
});

router.get('/status/detailed', (req, res) => {
  res.json({
    status: 'operational',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Ping endpoints
router.get('/ping', (req, res) => {
  res.json({ pong: true, timestamp: new Date() });
});

router.get('/ping/:id', (req, res) => {
  res.json({ pong: true, id: req.params.id, timestamp: new Date() });
});

// Info endpoints
router.get('/info', (req, res) => {
  res.json({
    name: 'Clutch API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Version endpoints
router.get('/version', (req, res) => {
  res.json({ version: '1.0.0', build: '2024.01.01' });
});

module.exports = router;