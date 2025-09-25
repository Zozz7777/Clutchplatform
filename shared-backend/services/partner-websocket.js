const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const PartnerUser = require('../models/PartnerUser');
const PartnerOrder = require('../models/PartnerOrder');
const logger = require('../config/logger');

class PartnerWebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
      },
      path: '/socket.io'
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clutch_secret_key');
        
        if (decoded.type !== 'partner') {
          return next(new Error('Authentication error: Invalid token type'));
        }

        // Verify partner exists and is active
        const partner = await PartnerUser.findByPartnerId(decoded.partnerId);
        if (!partner || partner.status !== 'active') {
          return next(new Error('Authentication error: Partner not found or inactive'));
        }

        socket.partnerId = decoded.partnerId;
        socket.deviceId = decoded.deviceId;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const partnerId = socket.partnerId;
      const deviceId = socket.deviceId;

      logger.info(`Partner WebSocket connected: ${partnerId} (device: ${deviceId || 'unknown'})`);

      // Join partner-specific room
      socket.join(`partner:${partnerId}`);

      // Handle device join
      socket.on('device_join', async (data) => {
        try {
          logger.info(`Device joined: ${data.deviceId} for partner ${partnerId}`);
          socket.deviceId = data.deviceId;
          socket.join(`device:${data.deviceId}`);
          
          // Send connection confirmation
          socket.emit('device_joined', {
            success: true,
            message: 'Device joined successfully',
            deviceId: data.deviceId,
            partnerId: partnerId
          });
        } catch (error) {
          logger.error('Device join error:', error);
          socket.emit('error', { message: 'Failed to join device' });
        }
      });

      // Handle sync requests
      socket.on('sync_request', async (data) => {
        try {
          const { lastSyncTimestamp, entityType } = data;
          
          // Get changes since last sync
          const changes = await this.getChangesSince(partnerId, lastSyncTimestamp, entityType);
          
          socket.emit('sync_response', {
            success: true,
            changes: changes,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Sync request error:', error);
          socket.emit('sync_error', { message: 'Sync failed' });
        }
      });

      // Handle order status updates
      socket.on('order_status_update', async (data) => {
        try {
          const { orderId, status, notes } = data;
          
          // Update order status
          await PartnerOrder.updateStatus(orderId, status, notes, partnerId);
          
          // Broadcast to all devices of this partner
          this.io.to(`partner:${partnerId}`).emit('order_updated', {
            orderId,
            status,
            notes,
            updatedAt: new Date().toISOString()
          });

          // Notify admin if order is ready for pickup
          if (status === 'ready_for_pickup') {
            this.io.to('admin').emit('order_ready', {
              orderId,
              partnerId,
              readyAt: new Date().toISOString()
            });
          }
        } catch (error) {
          logger.error('Order status update error:', error);
          socket.emit('error', { message: 'Failed to update order status' });
        }
      });

      // Handle payment notifications
      socket.on('payment_notification', async (data) => {
        try {
          const { orderId, paymentStatus, amount, method } = data;
          
          // Update payment status
          await PartnerOrder.updatePaymentStatus(orderId, paymentStatus, amount, method);
          
          // Broadcast payment update
          this.io.to(`partner:${partnerId}`).emit('payment_updated', {
            orderId,
            paymentStatus,
            amount,
            method,
            updatedAt: new Date().toISOString()
          });

          // Notify admin of payment
          this.io.to('admin').emit('payment_received', {
            orderId,
            partnerId,
            amount,
            method,
            status: paymentStatus,
            receivedAt: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Payment notification error:', error);
          socket.emit('error', { message: 'Failed to process payment notification' });
        }
      });

      // Handle inventory updates
      socket.on('inventory_update', async (data) => {
        try {
          const { productId, quantity, operation } = data;
          
          // Update inventory
          await this.updateInventory(partnerId, productId, quantity, operation);
          
          // Broadcast inventory update
          this.io.to(`partner:${partnerId}`).emit('inventory_updated', {
            productId,
            quantity,
            operation,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Inventory update error:', error);
          socket.emit('error', { message: 'Failed to update inventory' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        logger.info(`Partner WebSocket disconnected: ${partnerId} (reason: ${reason})`);
      });
    });
  }

  // Send new order to partner
  async sendNewOrder(partnerId, order) {
    try {
      this.io.to(`partner:${partnerId}`).emit('new_order', {
        orderId: order.orderId,
        customer: order.customer,
        service: order.service,
        total: order.total,
        priority: order.priority,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery
      });

      logger.info(`New order sent to partner ${partnerId}: ${order.orderId}`);
    } catch (error) {
      logger.error('Error sending new order:', error);
    }
  }

  // Send payment status update
  async sendPaymentUpdate(partnerId, orderId, paymentStatus, amount) {
    try {
      this.io.to(`partner:${partnerId}`).emit('payment_status_update', {
        orderId,
        paymentStatus,
        amount,
        updatedAt: new Date().toISOString()
      });

      logger.info(`Payment update sent to partner ${partnerId}: ${orderId} - ${paymentStatus}`);
    } catch (error) {
      logger.error('Error sending payment update:', error);
    }
  }

  // Send admin notification
  async sendAdminNotification(partnerId, type, message, data = {}) {
    try {
      this.io.to(`partner:${partnerId}`).emit('admin_notification', {
        type,
        message,
        data,
        timestamp: new Date().toISOString()
      });

      logger.info(`Admin notification sent to partner ${partnerId}: ${type}`);
    } catch (error) {
      logger.error('Error sending admin notification:', error);
    }
  }

  // Get changes since timestamp
  async getChangesSince(partnerId, timestamp, entityType = null) {
    try {
      const changes = {
        orders: [],
        payments: [],
        inventory: [],
        notifications: []
      };

      if (!entityType || entityType === 'orders') {
        changes.orders = await PartnerOrder.getChangesSince(partnerId, timestamp);
      }

      if (!entityType || entityType === 'payments') {
        // Get payment changes
        changes.payments = await this.getPaymentChanges(partnerId, timestamp);
      }

      if (!entityType || entityType === 'inventory') {
        // Get inventory changes
        changes.inventory = await this.getInventoryChanges(partnerId, timestamp);
      }

      return changes;
    } catch (error) {
      logger.error('Error getting changes since timestamp:', error);
      return { orders: [], payments: [], inventory: [], notifications: [] };
    }
  }

  // Update inventory
  async updateInventory(partnerId, productId, quantity, operation) {
    try {
      // Implement inventory update logic
      logger.info(`Inventory update: Partner ${partnerId}, Product ${productId}, ${operation} ${quantity}`);
    } catch (error) {
      logger.error('Error updating inventory:', error);
      throw error;
    }
  }

  // Get payment changes
  async getPaymentChanges(partnerId, timestamp) {
    try {
      // Implement payment changes logic
      return [];
    } catch (error) {
      logger.error('Error getting payment changes:', error);
      return [];
    }
  }

  // Get inventory changes
  async getInventoryChanges(partnerId, timestamp) {
    try {
      // Implement inventory changes logic
      return [];
    } catch (error) {
      logger.error('Error getting inventory changes:', error);
      return [];
    }
  }

  // Get connected partners
  getConnectedPartners() {
    const connectedPartners = new Set();
    
    this.io.sockets.sockets.forEach((socket) => {
      if (socket.partnerId) {
        connectedPartners.add(socket.partnerId);
      }
    });

    return Array.from(connectedPartners);
  }

  // Get partner connection status
  isPartnerConnected(partnerId) {
    return this.io.sockets.adapter.rooms.has(`partner:${partnerId}`);
  }
}

module.exports = PartnerWebSocketService;
