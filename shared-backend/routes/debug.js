const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getCollection } = require('../config/optimized-database');

// Debug endpoint for invitation status
router.get('/invitation-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const invitationsCollection = await getCollection('employee_invitations');
    const invitation = await invitationsCollection.findOne({ email });
    
    if (!invitation) {
      return res.json({ found: false, message: 'No invitation found' });
    }
    
    let tokenValid = false;
    let tokenError = null;
    
    if (invitation.invitationToken) {
      try {
        const decoded = jwt.verify(invitation.invitationToken, process.env.JWT_SECRET);
        tokenValid = true;
      } catch (error) {
        tokenError = error.message;
      }
    }
    
    res.json({
      found: true,
      email: invitation.email,
      status: invitation.status,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      tokenValid,
      tokenError,
      hasToken: !!invitation.invitationToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint for JWT test
router.get('/jwt-test', async (req, res) => {
  try {
    const testPayload = { email: 'test@example.com', type: 'employee_invitation' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      token: token.substring(0, 20) + '...',
      decoded,
      secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;