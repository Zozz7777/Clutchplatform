const express = require('express');
const router = express.Router();
const { logger } = require('../config/logger');

// Simple authentication middleware (non-blocking)
const simpleAuth = (req, res, next) => {
  // For now, just set a mock user
  req.user = { 
    id: 'test-user', 
    role: 'user',
    tenantId: 'test-tenant'
  };
  next();
};

// Create new digital wallet
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { walletName, walletType, balance, currency, isActive } = req.body;
    
    if (!walletName || !walletType) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Wallet name and type are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const newWallet = {
      id: `wallet-${Date.now()}`,
      walletName,
      walletType,
      balance: balance || 0,
      currency: currency || 'USD',
      userId: req.user.id,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newWallet,
      message: 'Digital wallet created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating digital wallet:', error);
    res.status(500).json({
      success: false,
      error: 'CREATE_WALLET_FAILED',
      message: 'Failed to create digital wallet',
      timestamp: new Date().toISOString()
    });
  }
});

// Get all digital wallets
router.get('/', simpleAuth, async (req, res) => {
  try {
    const digitalWallets = [
      {
        id: 'wallet-1',
        userId: 'user-456',
        walletType: 'credit_card',
        cardNumber: '****1234',
        cardHolder: 'John Doe',
        expiryDate: '12/25',
        isDefault: true,
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'wallet-2',
        userId: 'user-456',
        walletType: 'bank_account',
        accountNumber: '****5678',
        bankName: 'Chase Bank',
        routingNumber: '123456789',
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: digitalWallets,
      total: digitalWallets.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching digital wallets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch digital wallets',
      timestamp: new Date().toISOString()
    });
  }
});

// Get digital wallet by ID
router.get('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const digitalWallet = {
      id: id,
      userId: 'user-456',
      walletType: 'credit_card',
      cardNumber: '****1234',
      cardHolder: 'John Doe',
      expiryDate: '12/25',
      cvv: '***',
      billingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: digitalWallet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching digital wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch digital wallet',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new digital wallet
router.post('/', simpleAuth, async (req, res) => {
  try {
    const { 
      walletType, 
      cardNumber, 
      cardHolder, 
      expiryDate, 
      cvv, 
      billingAddress,
      isDefault 
    } = req.body;
    
    if (!walletType || !cardNumber || !cardHolder) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Wallet type, card number, and card holder are required',
        timestamp: new Date().toISOString()
      });
    }

    const digitalWallet = {
      id: `wallet-${Date.now()}`,
      userId: req.user.id,
      walletType,
      cardNumber: cardNumber.replace(/\d(?=\d{4})/g, '*'), // Mask card number
      cardHolder,
      expiryDate,
      cvv: cvv ? '***' : undefined,
      billingAddress: billingAddress || {},
      isDefault: isDefault || false,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Digital wallet created successfully',
      data: digitalWallet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating digital wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create digital wallet',
      timestamp: new Date().toISOString()
    });
  }
});

// Update digital wallet
router.put('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      cardHolder, 
      expiryDate, 
      billingAddress, 
      isDefault, 
      isActive 
    } = req.body;
    
    const digitalWallet = {
      id: id,
      userId: req.user.id,
      walletType: 'credit_card',
      cardNumber: '****1234',
      cardHolder: cardHolder || 'John Doe',
      expiryDate: expiryDate || '12/25',
      cvv: '***',
      billingAddress: billingAddress || {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      isDefault: isDefault !== undefined ? isDefault : true,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Digital wallet updated successfully',
      data: digitalWallet,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating digital wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update digital wallet',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete digital wallet
router.delete('/:id', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Digital wallet ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting digital wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete digital wallet',
      timestamp: new Date().toISOString()
    });
  }
});

// Set default wallet
router.patch('/:id/set-default', simpleAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: `Digital wallet ${id} set as default`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error setting default wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set default wallet',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;