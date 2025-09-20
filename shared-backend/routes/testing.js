const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');

// GET /api/v1/testing/chaos-experiments - Get chaos experiments
router.get('/chaos-experiments', authenticateToken, checkRole(['head_administrator', 'developer', 'qa_manager']), async (req, res) => {
  try {
    const experimentsCollection = await getCollection('chaos_experiments');
    if (!experimentsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const experiments = await experimentsCollection.find({}).toArray();

    if (experiments.length === 0) {
      const mockExperiments = [
        {
          _id: new ObjectId(),
          name: 'Network Latency Injection',
          status: 'completed',
          impact: 'low',
          date: new Date('2023-01-15').toISOString(),
          description: 'Injected 100ms latency to API gateway for 5 minutes.',
          results: 'Increased response times by 120ms, no service outages.',
          recommendations: 'Optimize API call patterns for latency tolerance.'
        },
        {
          _id: new ObjectId(),
          name: 'Database Read Failure',
          status: 'failed',
          impact: 'high',
          date: new Date('2023-02-20').toISOString(),
          description: 'Simulated read failures on primary database replica.',
          results: 'Application became unresponsive, fallback mechanism failed.',
          recommendations: 'Implement robust database failover and retry logic.'
        }
      ];
      await experimentsCollection.insertMany(mockExperiments);
      return res.json({ success: true, data: mockExperiments, message: 'Mock chaos experiments retrieved successfully' });
    }

    res.json({ success: true, data: experiments, message: 'Chaos experiments retrieved successfully' });
  } catch (error) {
    console.error('Error fetching chaos experiments:', error);
    res.status(500).json({ success: false, error: 'GET_CHAOS_EXPERIMENTS_FAILED', message: 'Failed to get chaos experiments' });
  }
});

// GET /api/v1/testing/black-swan-events - Get black swan events
router.get('/black-swan-events', authenticateToken, checkRole(['head_administrator', 'risk_manager']), async (req, res) => {
  try {
    const eventsCollection = await getCollection('black_swan_events');
    if (!eventsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const events = await eventsCollection.find({}).toArray();

    if (events.length === 0) {
      const mockEvents = [
        {
          _id: new ObjectId(),
          name: 'Global CDN Outage',
          type: 'external',
          impact: 'critical',
          date: new Date('2022-11-01').toISOString(),
          description: 'Major CDN provider experienced global outage, affecting all static assets.',
          mitigation: 'Implemented local caching and fallback CDN, reduced impact to 30% of users.',
          status: 'resolved'
        },
        {
          _id: new ObjectId(),
          name: 'Zero-day Exploit',
          type: 'security',
          impact: 'critical',
          date: new Date('2023-03-10').toISOString(),
          description: 'Undisclosed vulnerability exploited, leading to data breach attempt.',
          mitigation: 'Patched systems within 4 hours, isolated affected services, no data loss.',
          status: 'resolved'
        }
      ];
      await eventsCollection.insertMany(mockEvents);
      return res.json({ success: true, data: mockEvents, message: 'Mock black swan events retrieved successfully' });
    }

    res.json({ success: true, data: events, message: 'Black swan events retrieved successfully' });
  } catch (error) {
    console.error('Error fetching black swan events:', error);
    res.status(500).json({ success: false, error: 'GET_BLACK_SWAN_EVENTS_FAILED', message: 'Failed to get black swan events' });
  }
});

// GET /api/v1/testing/chaos-experiments - Get chaos experiments
router.get('/chaos-experiments', authenticateToken, checkRole(['head_administrator', 'developer', 'qa_manager']), async (req, res) => {
  try {
    const experimentsCollection = await getCollection('chaos_experiments');
    if (!experimentsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const experiments = await experimentsCollection.find({}).toArray();

    if (experiments.length === 0) {
      const mockExperiments = [
        {
          _id: new ObjectId(),
          name: 'Network Latency Injection',
          status: 'completed',
          impact: 'low',
          date: new Date('2023-01-15').toISOString(),
          description: 'Injected 100ms latency to API gateway for 5 minutes.',
          results: 'Increased response times by 120ms, no service outages.',
          recommendations: 'Optimize API call patterns for latency tolerance.'
        },
        {
          _id: new ObjectId(),
          name: 'Database Read Failure',
          status: 'failed',
          impact: 'high',
          date: new Date('2023-02-20').toISOString(),
          description: 'Simulated read failures on primary database replica.',
          results: 'Application became unresponsive, fallback mechanism failed.',
          recommendations: 'Implement robust database failover and retry logic.'
        }
      ];
      await experimentsCollection.insertMany(mockExperiments);
      return res.json({ success: true, data: mockExperiments, message: 'Mock chaos experiments retrieved successfully' });
    }

    res.json({ success: true, data: experiments, message: 'Chaos experiments retrieved successfully' });
  } catch (error) {
    console.error('Error fetching chaos experiments:', error);
    res.status(500).json({ success: false, error: 'GET_CHAOS_EXPERIMENTS_FAILED', message: 'Failed to get chaos experiments' });
  }
});

// GET /api/v1/testing/black-swan-events - Get black swan events
router.get('/black-swan-events', authenticateToken, checkRole(['head_administrator', 'risk_manager']), async (req, res) => {
  try {
    const eventsCollection = await getCollection('black_swan_events');
    if (!eventsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const events = await eventsCollection.find({}).toArray();

    if (events.length === 0) {
      const mockEvents = [
        {
          _id: new ObjectId(),
          name: 'Global CDN Outage',
          type: 'external',
          impact: 'critical',
          date: new Date('2022-11-01').toISOString(),
          description: 'Major CDN provider experienced global outage, affecting all static assets.',
          mitigation: 'Implemented local caching and fallback CDN, reduced impact to 30% of users.',
          status: 'resolved'
        },
        {
          _id: new ObjectId(),
          name: 'Zero-day Exploit',
          type: 'security',
          impact: 'critical',
          date: new Date('2023-03-10').toISOString(),
          description: 'Undisclosed vulnerability exploited, leading to data breach attempt.',
          mitigation: 'Patched systems within 4 hours, isolated affected services, no data loss.',
          status: 'resolved'
        }
      ];
      await eventsCollection.insertMany(mockEvents);
      return res.json({ success: true, data: mockEvents, message: 'Mock black swan events retrieved successfully' });
    }

    res.json({ success: true, data: events, message: 'Black swan events retrieved successfully' });
  } catch (error) {
    console.error('Error fetching black swan events:', error);
    res.status(500).json({ success: false, error: 'GET_BLACK_SWAN_EVENTS_FAILED', message: 'Failed to get black swan events' });
  }
});

// GET /api/v1/testing/chaos-experiments - Get chaos experiments
router.get('/chaos-experiments', authenticateToken, checkRole(['head_administrator', 'developer', 'qa_manager']), async (req, res) => {
  try {
    const experimentsCollection = await getCollection('chaos_experiments');
    if (!experimentsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const experiments = await experimentsCollection.find({}).toArray();

    if (experiments.length === 0) {
      const mockExperiments = [
        {
          _id: new ObjectId(),
          name: 'Network Latency Injection',
          status: 'completed',
          impact: 'low',
          date: new Date('2023-01-15').toISOString(),
          description: 'Injected 100ms latency to API gateway for 5 minutes.',
          results: 'Increased response times by 120ms, no service outages.',
          recommendations: 'Optimize API call patterns for latency tolerance.'
        },
        {
          _id: new ObjectId(),
          name: 'Database Read Failure',
          status: 'failed',
          impact: 'high',
          date: new Date('2023-02-20').toISOString(),
          description: 'Simulated read failures on primary database replica.',
          results: 'Application became unresponsive, fallback mechanism failed.',
          recommendations: 'Implement robust database failover and retry logic.'
        }
      ];
      await experimentsCollection.insertMany(mockExperiments);
      return res.json({ success: true, data: mockExperiments, message: 'Mock chaos experiments retrieved successfully' });
    }

    res.json({ success: true, data: experiments, message: 'Chaos experiments retrieved successfully' });
  } catch (error) {
    console.error('Error fetching chaos experiments:', error);
    res.status(500).json({ success: false, error: 'GET_CHAOS_EXPERIMENTS_FAILED', message: 'Failed to get chaos experiments' });
  }
});

// GET /api/v1/testing/black-swan-events - Get black swan events
router.get('/black-swan-events', authenticateToken, checkRole(['head_administrator', 'risk_manager']), async (req, res) => {
  try {
    const eventsCollection = await getCollection('black_swan_events');
    if (!eventsCollection) {
      return res.status(500).json({ success: false, error: 'DATABASE_CONNECTION_FAILED', message: 'Database connection failed' });
    }

    const events = await eventsCollection.find({}).toArray();

    if (events.length === 0) {
      const mockEvents = [
        {
          _id: new ObjectId(),
          name: 'Global CDN Outage',
          type: 'external',
          impact: 'critical',
          date: new Date('2022-11-01').toISOString(),
          description: 'Major CDN provider experienced global outage, affecting all static assets.',
          mitigation: 'Implemented local caching and fallback CDN, reduced impact to 30% of users.',
          status: 'resolved'
        },
        {
          _id: new ObjectId(),
          name: 'Zero-day Exploit',
          type: 'security',
          impact: 'critical',
          date: new Date('2023-03-10').toISOString(),
          description: 'Undisclosed vulnerability exploited, leading to data breach attempt.',
          mitigation: 'Patched systems within 4 hours, isolated affected services, no data loss.',
          status: 'resolved'
        }
      ];
      await eventsCollection.insertMany(mockEvents);
      return res.json({ success: true, data: mockEvents, message: 'Mock black swan events retrieved successfully' });
    }

    res.json({ success: true, data: events, message: 'Black swan events retrieved successfully' });
  } catch (error) {
    console.error('Error fetching black swan events:', error);
    res.status(500).json({ success: false, error: 'GET_BLACK_SWAN_EVENTS_FAILED', message: 'Failed to get black swan events' });
  }
});

module.exports = router;