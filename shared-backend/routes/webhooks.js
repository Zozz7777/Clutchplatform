const express = require('express');
const router = express.Router();

// Payment webhook
router.post('/payment', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment webhook endpoint working',
    data: { 
      event: req.body.event || 'payment.completed',
      processed: true,
      method: 'POST',
      path: '/payment',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// Notification webhook
router.post('/notification', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification webhook endpoint working',
    data: { 
      event: req.body.event || 'notification.sent',
      processed: true,
      method: 'POST',
      path: '/notification',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// Generic handlers for all HTTP methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'webhooks service is running',
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: 'webhooks item retrieved',
    data: { id: id, name: `Item ${id}`, status: 'active' },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: `/${id}`
  });
});

router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'webhooks item created',
    data: { id: Date.now(), ...req.body, createdAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/'
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: 'webhooks item updated',
    data: { id: id, ...req.body, updatedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'PUT',
    path: `/${id}`
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    success: true,
    message: 'webhooks item deleted',
    data: { id: id, deletedAt: new Date().toISOString() },
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    path: `/${id}`
  });
});

router.get('/search', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'webhooks search results',
    data: { query: req.query.q || '', results: [], total: 0 },
    timestamp: new Date().toISOString(),
    method: 'GET',
    path: '/search'
  });
});

module.exports = router;
