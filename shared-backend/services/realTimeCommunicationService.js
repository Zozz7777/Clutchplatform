/**
 * Real-Time Communication Service
 * Handles WebSocket connections, real-time notifications, and live updates
 */

const socketIo = require('socket.io');
const { Server } = require('socket.io');

class RealTimeCommunicationService {
    constructor() {
        this.io = null;
        this.rooms = new Map();
        this.userSockets = new Map();
        this.messageQueue = [];
        this.isInitialized = false;
    }

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
            console.log('✅ Real-Time Communication Service initialized');
        } catch (error) {
            console.error('❌ Real-Time Communication Service initialization failed:', error);
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

                // Verify token (placeholder - implement actual verification)
                socket.userId = 'user_' + Math.random().toString(36).substr(2, 9);
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

            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    async sendBookingUpdate(bookingId, updateData) {
        try {
            if (!this.isInitialized) {
                throw new Error('Real-Time Communication Service not initialized');
            }

            const { status, mechanicName, estimatedTime } = updateData;

            // Emit to booking room
            this.io.to(`booking:${bookingId}`).emit('booking_update', {
                bookingId,
                status,
                mechanicName,
                estimatedTime,
                timestamp: new Date()
            });

            // Log the update
            console.log(`📋 Booking update sent: ${bookingId} - ${status}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to send booking update:', error);
            return false;
        }
    }

    async sendNotification(userId, notificationData) {
        try {
            if (!this.isInitialized) {
                throw new Error('Real-Time Communication Service not initialized');
            }

            const { message, type = 'info' } = notificationData;

            // Emit to user's personal room
            this.io.to(`user:${userId}`).emit('notification', {
                message,
                type,
                timestamp: new Date(),
                id: 'notification_' + Date.now()
            });

            // Log the notification
            console.log(`📱 Notification sent to user ${userId}: ${message}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to send notification:', error);
            return false;
        }
    }

    async broadcastToAll(event, data) {
        try {
            if (!this.isInitialized) {
                throw new Error('Real-Time Communication Service not initialized');
            }

            this.io.emit(event, {
                ...data,
                timestamp: new Date()
            });

            console.log(`📢 Broadcast sent: ${event}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to broadcast:', error);
            return false;
        }
    }

    async joinRoom(userId, roomId) {
        try {
            const userSockets = this.userSockets.get(userId);
            if (userSockets) {
                userSockets.forEach(socket => {
                    socket.join(roomId);
                });
            }

            // Track room membership
            if (!this.rooms.has(roomId)) {
                this.rooms.set(roomId, new Set());
            }
            this.rooms.get(roomId).add(userId);

            console.log(`👥 User ${userId} joined room ${roomId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to join room:', error);
            return false;
        }
    }

    async leaveRoom(userId, roomId) {
        try {
            const userSockets = this.userSockets.get(userId);
            if (userSockets) {
                userSockets.forEach(socket => {
                    socket.leave(roomId);
                });
            }

            // Remove from room tracking
            const room = this.rooms.get(roomId);
            if (room) {
                room.delete(userId);
                if (room.size === 0) {
                    this.rooms.delete(roomId);
                }
            }

            console.log(`👋 User ${userId} left room ${roomId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to leave room:', error);
            return false;
        }
    }

    handleBookingUpdate(socket, data) {
        console.log('📋 Booking update received:', data);
        // Handle booking update logic
    }

    handleServiceStatusChange(socket, data) {
        console.log('🔧 Service status change received:', data);
        // Handle service status change logic
    }

    handlePaymentNotification(socket, data) {
        console.log('💳 Payment notification received:', data);
        // Handle payment notification logic
    }

    handleChatMessage(socket, data) {
        console.log('💬 Chat message received:', data);
        // Handle chat message logic
    }

    handleLocationUpdate(socket, data) {
        console.log('📍 Location update received:', data);
        // Handle location update logic
    }

    handleNotification(socket, data) {
        console.log('📱 Notification received:', data);
        // Handle notification logic
    }

    handleDisconnect(socket) {
        console.log(`🔌 User disconnected: ${socket.userId}`);
        
        // Remove socket from user's socket set
        const userSockets = this.userSockets.get(socket.userId);
        if (userSockets) {
            userSockets.delete(socket);
            if (userSockets.size === 0) {
                this.userSockets.delete(socket.userId);
            }
        }
    }

    getSocketCount() {
        return this.io ? this.io.engine.clientsCount : 0;
    }

    getConnectedUsers() {
        return Array.from(this.userSockets.keys());
    }

    getRoomMembers(roomId) {
        const room = this.rooms.get(roomId);
        return room ? Array.from(room) : [];
    }

    async getServiceStatus() {
        return {
            isInitialized: this.isInitialized,
            connectedUsers: this.getConnectedUsers().length,
            activeRooms: this.rooms.size,
            socketCount: this.getSocketCount(),
            lastActivity: new Date()
        };
    }
}

module.exports = new RealTimeCommunicationService();
