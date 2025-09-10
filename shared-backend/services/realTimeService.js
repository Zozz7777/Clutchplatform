const socketIo = require('socket.io');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const userService = require('./userService');
const databaseUtils = require('../utils/databaseUtils');
const authService = require('./authService');

class RealTimeService {
    constructor() {
        this.io = null;
        this.rooms = new Map();
        this.userSockets = new Map();
        this.messageQueue = [];
        this.isInitialized = false;
    }

    // ==================== WEBSOCKET INFRASTRUCTURE ====================
    
    initializeSocketServer(server) {
        try {
            this.io = new Server(server, {
                cors: {
                    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
                    methods: ["GET", "POST"],
                    credentials: true
                },
                transports: ['websocket', 'polling'],
                allowEIO3: true
            });

            this.setupSocketHandlers();
            this.isInitialized = true;
            console.log('✅ WebSocket server initialized successfully');
        } catch (error) {
            console.error('❌ WebSocket initialization error:', error);
            throw error;
        }
    }

    setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                // Authenticate socket connection
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = authService.verifyJWTToken(token.replace('Bearer ', ''));
                if (!decoded) {
                    return next(new Error('Invalid token'));
                }

                socket.userId = decoded.userId;
                socket.userPermissions = decoded.permissions;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`🔌 User connected: ${socket.userId}`);
            
            // Store socket reference
            if (!this.userSockets.has(socket.userId)) {
                this.userSockets.set(socket.userId, new Set());
            }
            this.userSockets.get(socket.userId).add(socket);

            // Join user to their personal room
            socket.join(`user:${socket.userId}`);

            // Handle booking updates
            socket.on('booking_update', (data) => {
                this.handleBookingUpdate(socket, data);
            });

            // Handle service status changes
            socket.on('service_status_change', (data) => {
                this.handleServiceStatusChange(socket, data);
            });

            // Handle payment notifications
            socket.on('payment_notification', (data) => {
                this.handlePaymentNotification(socket, data);
            });

            // Handle chat messages
            socket.on('chat_message', (data) => {
                this.handleChatMessage(socket, data);
            });

            // Handle location updates
            socket.on('location_update', (data) => {
                this.handleLocationUpdate(socket, data);
            });

            // Handle notifications
            socket.on('notification', (data) => {
                this.handleNotification(socket, data);
            });

            // Handle typing indicators
            socket.on('typing_start', (data) => {
                this.handleTypingStart(socket, data);
            });

            socket.on('typing_stop', (data) => {
                this.handleTypingStop(socket, data);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        });
    }

    // ==================== CHAT FUNCTIONALITY ====================

    async createChatRoom(participants, roomType = 'direct', metadata = {}) {
        try {
            const roomData = {
                roomId: databaseUtils.generateId(),
                participants: participants.map(p => ({
                    userId: p.userId,
                    role: p.role || 'member',
                    joinedAt: new Date()
                })),
                roomType,
                metadata,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            };

            const result = await databaseUtils.create('chat_rooms', roomData);
            return result;
        } catch (error) {
            console.error('Create chat room error:', error);
            throw error;
        }
    }

    async sendChatMessage(roomId, senderId, message, messageType = 'text', metadata = {}) {
        try {
            const messageData = {
                messageId: databaseUtils.generateId(),
                roomId,
                senderId,
                message,
                messageType,
                metadata,
                timestamp: new Date(),
                isRead: false,
                isActive: true
            };

            const result = await databaseUtils.create('chat_messages', messageData);
            
            // Emit to room
            this.io.to(`room:${roomId}`).emit('new_message', {
                ...messageData,
                _id: result.insertedId
            });

            return result;
        } catch (error) {
            console.error('Send chat message error:', error);
            throw error;
        }
    }

    async getChatHistory(roomId, limit = 50, offset = 0) {
        try {
            const query = { roomId, isActive: true };
            const options = {
                sort: { timestamp: -1 },
                limit: limit,
                skip: offset
            };

            const messages = await databaseUtils.find('chat_messages', query, options);
            return messages.reverse(); // Return in chronological order
        } catch (error) {
            console.error('Get chat history error:', error);
            throw error;
        }
    }

    async markMessagesAsRead(roomId, userId, messageIds) {
        try {
            const filter = {
                roomId,
                _id: { $in: messageIds.map(id => databaseUtils.toObjectId(id)) },
                senderId: { $ne: userId }
            };

            const update = {
                $set: { isRead: true, readAt: new Date() }
            };

            const result = await databaseUtils.updateMany('chat_messages', filter, update);
            return result;
        } catch (error) {
            console.error('Mark messages as read error:', error);
            throw error;
        }
    }

    // ==================== UTILITY METHODS ====================
    
    async getSubscribedUsers(serviceId) {
        try {
            // Get users subscribed to service updates
            const subscriptions = await databaseUtils.find('subscriptions', {
                serviceId,
                isActive: true
            });
            return subscriptions.map(sub => sub.userId);
        } catch (error) {
            console.error('Get subscribed users error:', error);
            return [];
        }
    }

    emitToUser(userId, event, data) {
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
            userSockets.forEach(socket => {
                socket.emit(event, data);
            });
        }
    }

    emitToRoom(roomId, event, data) {
        this.io.to(`room:${roomId}`).emit(event, data);
    }

    emitToAll(event, data) {
        this.io.emit(event, data);
    }

    getSocketCount() {
        return this.io.engine.clientsCount;
    }

    // ==================== NOTIFICATION SYSTEM ====================

    async sendNotification(userId, title, message, type = 'info', data = {}) {
        try {
            const notificationData = {
                notificationId: databaseUtils.generateId(),
                userId,
                title,
                message,
                type,
                data,
                timestamp: new Date(),
                isRead: false,
                isActive: true
            };

            const result = await databaseUtils.create('notifications', notificationData);
            
            // Emit to user
            this.emitToUser(userId, 'notification', notificationData);
            
            return result;
        } catch (error) {
            console.error('Send notification error:', error);
            throw error;
        }
    }

    async sendPushNotification(userId, title, message, data = {}) {
        try {
            // Get user's device tokens
            const deviceTokens = await databaseUtils.find('device_tokens', {
                userId,
                isActive: true
            });

            if (deviceTokens.length === 0) {
                return false;
            }

            const tokens = deviceTokens.map(dt => dt.token);
            
            // Send to Firebase
            const messageData = {
                notification: {
                    title,
                    body: message
                },
                data: {
                    ...data,
                    timestamp: Date.now().toString()
                },
                tokens
            };

            const response = await admin.messaging().sendMulticast(messageData);
            return response;
        } catch (error) {
            console.error('Send push notification error:', error);
            throw error;
        }
    }

    async scheduleNotification(userId, title, message, scheduledAt, type = 'info', data = {}) {
        try {
            const notificationData = {
                notificationId: databaseUtils.generateId(),
                userId,
                title,
                message,
                type,
                data,
                scheduledAt,
                timestamp: new Date(),
                isRead: false,
                isActive: true,
                isScheduled: true
            };

            const result = await databaseUtils.create('notifications', notificationData);
            
            // Schedule the notification
            const delay = scheduledAt.getTime() - Date.now();
            if (delay > 0) {
                setTimeout(() => {
                    this.sendNotification(userId, title, message, type, data);
                }, delay);
            }
            
            return result;
        } catch (error) {
            console.error('Schedule notification error:', error);
            throw error;
        }
    }

    async cancelScheduledNotification(notificationId) {
        try {
            const filter = { notificationId, isScheduled: true };
            const update = { 
                $set: { 
                    isScheduled: false, 
                    isCancelled: true,
                    updatedAt: new Date()
                }
            };

            const result = await databaseUtils.updateOne('notifications', filter, update);
            return result;
        } catch (error) {
            console.error('Cancel scheduled notification error:', error);
            throw error;
        }
    }
}

module.exports = new RealTimeService();
