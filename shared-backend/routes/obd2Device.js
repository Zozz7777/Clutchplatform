const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Public test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'OBD2 Device routes are working',
    timestamp: new Date().toISOString()
  });
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Endpoint - implementation pending',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'GET_FAILED',
      message: 'Failed to retrieve data'
    });
  }
});

module.exports = router;
