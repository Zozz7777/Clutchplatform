const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const sessionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many session requests, please try again later.'
});

// GET /api/v1/sessions/active - Get active sessions
router.get('/active', sessionLimiter, authenticateToken, async (req, res) => {
  try {
    // Get active sessions from database
    const sessionsCollection = await getCollection('sessions');
    const activeSessions = await sessionsCollection.find({
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).toArray();

    // Get session statistics
    const totalSessions = await sessionsCollection.countDocuments();
    const activeCount = activeSessions.length;
    const expiredCount = await sessionsCollection.countDocuments({
      expiresAt: { $lte: new Date() }
    });

    // Get user information for active sessions
    const userIds = [...new Set(activeSessions.map(session => session.userId))];
    const usersCollection = await getCollection('users');
    const users = await usersCollection.find({
      _id: { $in: userIds }
    }).toArray();

    const sessionsWithUsers = activeSessions.map(session => {
      const user = users.find(u => u._id.toString() === session.userId);
      return {
        ...session,
        user: user ? {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        activeSessions: sessionsWithUsers,
        statistics: {
          total: totalSessions,
          active: activeCount,
          expired: expiredCount
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions',
      message: error.message
    });
  }
});

// GET /api/v1/sessions/statistics - Get session statistics
router.get('/statistics', sessionLimiter, authenticateToken, async (req, res) => {
  try {
    const sessionsCollection = await getCollection('sessions');
    
    // Get session statistics for the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      totalSessions,
      activeSessions,
      expiredSessions,
      sessionsLast24h,
      uniqueUsers
    ] = await Promise.all([
      sessionsCollection.countDocuments(),
      sessionsCollection.countDocuments({ status: 'active' }),
      sessionsCollection.countDocuments({ status: 'expired' }),
      sessionsCollection.countDocuments({ createdAt: { $gte: last24Hours } }),
      sessionsCollection.distinct('userId')
    ]);

    // Get hourly session data for the last 24 hours
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourSessions = await sessionsCollection.countDocuments({
        createdAt: { $gte: hourStart, $lt: hourEnd }
      });
      
      hourlyData.push({
        hour: hourStart.toISOString(),
        sessions: hourSessions
      });
    }

    res.json({
      success: true,
      data: {
        statistics: {
          total: totalSessions,
          active: activeSessions,
          expired: expiredSessions,
          last24Hours: sessionsLast24h,
          uniqueUsers: uniqueUsers.length
        },
        hourlyData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting session statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session statistics',
      message: error.message
    });
  }
});

// DELETE /api/v1/sessions/:sessionId - Terminate a session
router.delete('/:sessionId', sessionLimiter, authenticateToken, checkRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionsCollection = await getCollection('sessions');
    const result = await sessionsCollection.updateOne(
      { _id: sessionId },
      { 
        $set: { 
          status: 'terminated',
          terminatedAt: new Date(),
          terminatedBy: req.user.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to terminate session',
      message: error.message
    });
  }
});

module.exports = router;
