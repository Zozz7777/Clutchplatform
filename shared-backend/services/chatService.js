const dbService = require('./databaseService');
const { sendPushNotification } = require('./notificationService');
const { sendSMS } = require('./smsService');
const { sendEmail } = require('./emailService');

class ChatService {
    constructor() {
        this.activeConnections = new Map(); // userId -> socket connection
        this.roomConnections = new Map(); // roomId -> Set of userIds
    }

    /**
     * Initialize chat service with Socket.IO
     * @param {Object} io - Socket.IO instance
     */
    initialize(io) {
        this.io = io;

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // Join user to their personal room
            socket.on('join-user', async (userId) => {
                try {
                    await this.joinUserRoom(socket, userId);
                } catch (error) {
                    console.error('Join user room error:', error);
                }
            });

            // Join booking chat room
            socket.on('join-booking-chat', async (bookingId, userId) => {
                try {
                    await this.joinBookingChat(socket, bookingId, userId);
                } catch (error) {
                    console.error('Join booking chat error:', error);
                }
            });

            // Send message
            socket.on('send-message', async (messageData) => {
                try {
                    await this.handleMessage(socket, messageData);
                } catch (error) {
                    console.error('Send message error:', error);
                }
            });

            // Typing indicator
            socket.on('typing', async (data) => {
                try {
                    await this.handleTyping(socket, data);
                } catch (error) {
                    console.error('Typing indicator error:', error);
                }
            });

            // Read receipts
            socket.on('mark-read', async (messageId, userId) => {
                try {
                    await this.markMessageAsRead(messageId, userId);
                } catch (error) {
                    console.error('Mark read error:', error);
                }
            });

            // Disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    /**
     * Join user to their personal room
     * @param {Object} socket - Socket connection
     * @param {string} userId - User ID
     */
    async joinUserRoom(socket, userId) {
        // Store connection
        this.activeConnections.set(userId, socket);
        socket.userId = userId;

        // Join personal room
        socket.join(`user:${userId}`);

        // Update user online status
        await dbService.updateOne('users', 
            { _id: userId },
            { 
                isOnline: true,
                lastSeen: new Date()
            }
        );

        socket.emit('joined-user-room', { userId });
    }

    /**
     * Join booking chat room
     * @param {Object} socket - Socket connection
     * @param {string} bookingId - Booking ID
     * @param {string} userId - User ID
     */
    async joinBookingChat(socket, bookingId, userId) {
        // Verify user has access to this booking
        const booking = await dbService.findOne('bookings', {
            _id: bookingId,
            $or: [
                { userId },
                { mechanicId: userId }
            ]
        });

        if (!booking) {
            socket.emit('error', { message: 'Access denied to this chat' });
            return;
        }

        const roomId = `booking:${bookingId}`;
        
        // Join room
        socket.join(roomId);
        
        // Track room connections
        if (!this.roomConnections.has(roomId)) {
            this.roomConnections.set(roomId, new Set());
        }
        this.roomConnections.get(roomId).add(userId);

        // Get chat history
        const messages = await this.getChatHistory(bookingId);

        socket.emit('joined-booking-chat', {
            bookingId,
            roomId,
            messages
        });

        // Notify others in room
        socket.to(roomId).emit('user-joined-chat', {
            userId,
            bookingId
        });
    }

    /**
     * Handle incoming message
     * @param {Object} socket - Socket connection
     * @param {Object} messageData - Message data
     */
    async handleMessage(socket, messageData) {
        const {
            bookingId,
            senderId,
            content,
            messageType = 'text',
            attachments = []
        } = messageData;

        // Validate message
        if (!bookingId || !senderId || !content) {
            socket.emit('error', { message: 'Invalid message data' });
            return;
        }

        // Verify sender has access to this booking
        const booking = await dbService.findOne('bookings', {
            _id: bookingId,
            $or: [
                { userId: senderId },
                { mechanicId: senderId }
            ]
        });

        if (!booking) {
            socket.emit('error', { message: 'Access denied to this chat' });
            return;
        }

        // Create message
        const message = {
            bookingId,
            senderId,
            content,
            messageType,
            attachments,
            timestamp: new Date(),
            readBy: [senderId],
            status: 'sent'
        };

        // Save to database
        const savedMessage = await dbService.insertOne('messages', message);

        // Add message ID
        message._id = savedMessage.insertedId;

        // Emit to room
        const roomId = `booking:${bookingId}`;
        this.io.to(roomId).emit('new-message', message);

        // Send push notifications to offline users
        await this.sendMessageNotifications(message, booking);

        // Update booking last message
        await dbService.updateOne('bookings',
            { _id: bookingId },
            {
                lastMessage: {
                    content: content.substring(0, 100),
                    timestamp: new Date(),
                    senderId
                }
            }
        );
    }

    /**
     * Handle typing indicator
     * @param {Object} socket - Socket connection
     * @param {Object} data - Typing data
     */
    async handleTyping(socket, data) {
        const { bookingId, userId, isTyping } = data;

        const roomId = `booking:${bookingId}`;
        
        // Emit to others in room
        socket.to(roomId).emit('user-typing', {
            userId,
            isTyping,
            bookingId
        });
    }

    /**
     * Mark message as read
     * @param {string} messageId - Message ID
     * @param {string} userId - User ID
     */
    async markMessageAsRead(messageId, userId) {
        try {
            // Update message read status
            await dbService.updateOne('messages',
                { _id: messageId },
                { $addToSet: { readBy: userId } }
            );

            // Emit read receipt
            this.io.emit('message-read', {
                messageId,
                userId,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Mark message as read error:', error);
        }
    }

    /**
     * Handle user disconnect
     * @param {Object} socket - Socket connection
     */
    handleDisconnect(socket) {
        const userId = socket.userId;
        
        if (userId) {
            // Remove from active connections
            this.activeConnections.delete(userId);

            // Update user online status
            dbService.updateOne('users',
                { _id: userId },
                {
                    isOnline: false,
                    lastSeen: new Date()
                }
            ).catch(error => {
                console.error('Update user status error:', error);
            });

            // Remove from room connections
            for (const [roomId, users] of this.roomConnections.entries()) {
                users.delete(userId);
                if (users.size === 0) {
                    this.roomConnections.delete(roomId);
                }
            }
        }

        console.log(`User disconnected: ${socket.id}`);
    }

    /**
     * Get chat history for a booking
     * @param {string} bookingId - Booking ID
     * @param {number} limit - Number of messages to retrieve
     * @returns {Array} Chat messages
     */
    async getChatHistory(bookingId, limit = 50) {
        try {
            const messages = await dbService.find('messages',
                { bookingId },
                {
                    sort: { timestamp: -1 },
                    limit
                }
            );

            // Get sender details
            const userIds = [...new Set(messages.map(m => m.senderId))];
            const users = await dbService.find('users',
                { _id: { $in: userIds } },
                {
                    projection: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        userType: 1,
                        profileImage: 1
                    }
                }
            );

            const userMap = new Map(users.map(u => [u._id.toString(), u]));

            // Add sender details to messages
            return messages.map(message => ({
                ...message,
                sender: userMap.get(message.senderId.toString())
            })).reverse(); // Return in chronological order

        } catch (error) {
            console.error('Get chat history error:', error);
            return [];
        }
    }

    /**
     * Send message notifications to offline users
     * @param {Object} message - Message object
     * @param {Object} booking - Booking object
     */
    async sendMessageNotifications(message, booking) {
        try {
            // Get recipient (opposite of sender)
            const recipientId = message.senderId === booking.userId ? booking.mechanicId : booking.userId;
            
            if (!recipientId) return;

            // Check if recipient is online
            const isOnline = this.activeConnections.has(recipientId);
            
            if (isOnline) return; // Skip if user is online

            // Get recipient details
            const recipient = await dbService.findOne('users', { _id: recipientId });
            if (!recipient) return;

            // Get sender details
            const sender = await dbService.findOne('users', { _id: message.senderId });
            if (!sender) return;

            const senderName = `${sender.firstName} ${sender.lastName}`;
            const notificationTitle = `New message from ${senderName}`;
            const notificationBody = message.content.length > 50 
                ? `${message.content.substring(0, 50)}...` 
                : message.content;

            // Send push notification
            if (recipient.deviceToken) {
                await sendPushNotification(recipient.deviceToken, {
                    title: notificationTitle,
                    body: notificationBody,
                    data: {
                        type: 'new_message',
                        bookingId: booking._id.toString(),
                        senderId: message.senderId.toString(),
                        messageId: message._id.toString()
                    }
                });
            }

            // Send SMS notification (if enabled)
            if (recipient.notificationSettings?.sms && recipient.phone) {
                await sendSMS(recipient.phone, 
                    `${notificationTitle}: ${notificationBody}`
                );
            }

            // Send email notification (if enabled)
            if (recipient.notificationSettings?.email && recipient.email) {
                await sendEmail(recipient.email, notificationTitle, `
                    <h3>New Message</h3>
                    <p><strong>From:</strong> ${senderName}</p>
                    <p><strong>Message:</strong> ${message.content}</p>
                    <p><strong>Booking:</strong> ${booking._id}</p>
                    <p>Click here to view the message in your app.</p>
                `);
            }

        } catch (error) {
            console.error('Send message notifications error:', error);
        }
    }

    /**
     * Send system message to booking chat
     * @param {string} bookingId - Booking ID
     * @param {string} content - Message content
     * @param {string} messageType - Message type
     */
    async sendSystemMessage(bookingId, content, messageType = 'system') {
        try {
            const message = {
                bookingId,
                senderId: 'system',
                content,
                messageType,
                timestamp: new Date(),
                readBy: [],
                status: 'sent'
            };

            // Save to database
            const savedMessage = await dbService.insertOne('messages', message);
            message._id = savedMessage.insertedId;

            // Emit to room
            const roomId = `booking:${bookingId}`;
            this.io.to(roomId).emit('new-message', message);

        } catch (error) {
            console.error('Send system message error:', error);
        }
    }

    /**
     * Get unread message count for user
     * @param {string} userId - User ID
     * @returns {number} Unread message count
     */
    async getUnreadCount(userId) {
        try {
            // Get user's bookings
            const bookings = await dbService.find('bookings', {
                $or: [
                    { userId },
                    { mechanicId: userId }
                ]
            });

            const bookingIds = bookings.map(b => b._id);

            // Count unread messages
            const unreadCount = await dbService.count('messages', {
                bookingId: { $in: bookingIds },
                senderId: { $ne: userId },
                readBy: { $ne: userId }
            });

            return unreadCount;

        } catch (error) {
            console.error('Get unread count error:', error);
            return 0;
        }
    }

    /**
     * Mark all messages as read for a booking
     * @param {string} bookingId - Booking ID
     * @param {string} userId - User ID
     */
    async markAllAsRead(bookingId, userId) {
        try {
            await dbService.updateMany('messages',
                {
                    bookingId,
                    senderId: { $ne: userId },
                    readBy: { $ne: userId }
                },
                { $addToSet: { readBy: userId } }
            );

        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    }

    /**
     * Get active chat rooms for user
     * @param {string} userId - User ID
     * @returns {Array} Active chat rooms
     */
    async getActiveChats(userId) {
        try {
            const bookings = await dbService.find('bookings', {
                $or: [
                    { userId },
                    { mechanicId: userId }
                ],
                status: { $in: ['confirmed', 'in_progress', 'completed'] }
            }, {
                sort: { lastMessage: { timestamp: -1 } }
            });

            // Get last message for each booking
            const chats = await Promise.all(bookings.map(async (booking) => {
                const lastMessage = await dbService.findOne('messages',
                    { bookingId: booking._id },
                    { sort: { timestamp: -1 } }
                );

                const unreadCount = await dbService.count('messages', {
                    bookingId: booking._id,
                    senderId: { $ne: userId },
                    readBy: { $ne: userId }
                });

                return {
                    bookingId: booking._id,
                    booking: booking,
                    lastMessage,
                    unreadCount
                };
            }));

            return chats;

        } catch (error) {
            console.error('Get active chats error:', error);
            return [];
        }
    }

    /**
     * Delete message
     * @param {string} messageId - Message ID
     * @param {string} userId - User ID (sender)
     */
    async deleteMessage(messageId, userId) {
        try {
            const message = await dbService.findOne('messages', {
                _id: messageId,
                senderId: userId
            });

            if (!message) {
                throw new Error('Message not found or access denied');
            }

            // Soft delete (mark as deleted)
            await dbService.updateOne('messages',
                { _id: messageId },
                { 
                    deleted: true,
                    deletedAt: new Date()
                }
            );

            // Emit to room
            const roomId = `booking:${message.bookingId}`;
            this.io.to(roomId).emit('message-deleted', {
                messageId,
                bookingId: message.bookingId
            });

        } catch (error) {
            console.error('Delete message error:', error);
            throw error;
        }
    }
}

module.exports = new ChatService();
