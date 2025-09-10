const express = require('express');
const router = express.Router();
const realTimeService = require('../services/realTimeService');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { ChatRoom } = require('../models/chatRoom');
const { ChatMessage } = require('../models/chatMessage');
const { Notification } = require('../models/notification');
const { DeviceToken } = require('../models/deviceToken');

// ==================== WEBSOCKET CONNECTION ROUTES ====================

// Get WebSocket connection info
router.get('/socket-info', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        res.json({
            success: true,
            message: 'WebSocket connection info',
            data: {
                connected: realTimeService.userSockets.has(userId),
                socketCount: realTimeService.getSocketCount(),
                connectionUrl: process.env.WEBSOCKET_URL || 'ws://localhost:3000'
            }
        });
    } catch (error) {
        console.error('Get socket info error:', error);
        res.status(500).json({
            success: false,
            error: 'SOCKET_INFO_FAILED',
            message: 'Failed to get socket information'
        });
    }
});

// ==================== PUSH NOTIFICATION ROUTES ====================

// Register device token
router.post('/notifications/register-device', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { token, deviceInfo } = req.body;

        if (!token || !deviceInfo) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Token and device info are required'
            });
        }

        const deviceToken = await realTimeService.registerDeviceToken(userId, token, deviceInfo);

        res.json({
            success: true,
            message: 'Device token registered successfully',
            data: deviceToken
        });
    } catch (error) {
        console.error('Register device token error:', error);
        res.status(500).json({
            success: false,
            error: 'DEVICE_REGISTRATION_FAILED',
            message: 'Failed to register device token'
        });
    }
});

// Unregister device token
router.post('/notifications/unregister-device', authenticateToken, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_TOKEN',
                message: 'Device token is required'
            });
        }

        await realTimeService.unregisterDeviceToken(token);

        res.json({
            success: true,
            message: 'Device token unregistered successfully'
        });
    } catch (error) {
        console.error('Unregister device token error:', error);
        res.status(500).json({
            success: false,
            error: 'DEVICE_UNREGISTRATION_FAILED',
            message: 'Failed to unregister device token'
        });
    }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, type, limit = 50, offset = 0 } = req.query;

        const options = {
            status,
            type,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const notifications = await Notification.findUserNotifications(userId, options);

        res.json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_NOTIFICATIONS_FAILED',
            message: 'Failed to retrieve notifications'
        });
    }
});

// Mark notifications as read
router.put('/notifications/mark-read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { notificationIds } = req.body;

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_NOTIFICATION_IDS',
                message: 'Notification IDs array is required'
            });
        }

        await Notification.markAsRead(notificationIds, userId);

        res.json({
            success: true,
            message: 'Notifications marked as read successfully'
        });
    } catch (error) {
        console.error('Mark notifications as read error:', error);
        res.status(500).json({
            success: false,
            error: 'MARK_READ_FAILED',
            message: 'Failed to mark notifications as read'
        });
    }
});

// Update push notification settings
router.put('/notifications/settings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pushSettings } = req.body;

        if (!pushSettings) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PUSH_SETTINGS',
                message: 'Push settings are required'
            });
        }

        // Update all device tokens for the user
        await DeviceToken.updateMany(
            { userId },
            { pushSettings }
        );

        res.json({
            success: true,
            message: 'Push notification settings updated successfully'
        });
    } catch (error) {
        console.error('Update push settings error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_SETTINGS_FAILED',
            message: 'Failed to update push notification settings'
        });
    }
});

// Send test notification
router.post('/notifications/test', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_NOTIFICATION_CONTENT',
                message: 'Title and body are required'
            });
        }

        await realTimeService.sendPushNotification(userId, {
            title,
            body,
            data: { type: 'test' }
        });

        res.json({
            success: true,
            message: 'Test notification sent successfully'
        });
    } catch (error) {
        console.error('Send test notification error:', error);
        res.status(500).json({
            success: false,
            error: 'TEST_NOTIFICATION_FAILED',
            message: 'Failed to send test notification'
        });
    }
});

// ==================== CHAT SYSTEM ROUTES ====================

// Create chat room
router.post('/chat/rooms', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { participants, type = 'direct', name, description } = req.body;

        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PARTICIPANTS',
                message: 'Participants array is required'
            });
        }

        // Add current user to participants if not already included
        if (!participants.includes(userId)) {
            participants.push(userId);
        }

        let chatRoom;
        if (type === 'direct' && participants.length === 2) {
            // Check if direct chat already exists
            chatRoom = await ChatRoom.findDirectChat(participants[0], participants[1]);
            if (!chatRoom) {
                chatRoom = await realTimeService.createChatRoom(participants, {
                    type,
                    name,
                    description
                });
            }
        } else {
            chatRoom = await realTimeService.createChatRoom(participants, {
                type,
                name,
                description
            });
        }

        res.status(201).json({
            success: true,
            message: 'Chat room created successfully',
            data: chatRoom
        });
    } catch (error) {
        console.error('Create chat room error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_CHAT_ROOM_FAILED',
            message: 'Failed to create chat room'
        });
    }
});

// Get user's chat rooms
router.get('/chat/rooms', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, limit = 50, offset = 0 } = req.query;

        const options = {
            type,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        const chatRooms = await ChatRoom.findUserRooms(userId, options);

        res.json({
            success: true,
            message: 'Chat rooms retrieved successfully',
            data: chatRooms
        });
    } catch (error) {
        console.error('Get chat rooms error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CHAT_ROOMS_FAILED',
            message: 'Failed to retrieve chat rooms'
        });
    }
});

// Get chat room details
router.get('/chat/rooms/:roomId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { roomId } = req.params;

        const chatRoom = await ChatRoom.findById(roomId)
            .populate('participants', 'fullName email profilePicture')
            .populate('lastMessage.senderId', 'fullName');

        if (!chatRoom) {
            return res.status(404).json({
                success: false,
                error: 'CHAT_ROOM_NOT_FOUND',
                message: 'Chat room not found'
            });
        }

        // Check if user is participant
        if (!chatRoom.isParticipant(userId)) {
            return res.status(403).json({
                success: false,
                error: 'ACCESS_DENIED',
                message: 'Access denied to this chat room'
            });
        }

        res.json({
            success: true,
            message: 'Chat room details retrieved successfully',
            data: chatRoom
        });
    } catch (error) {
        console.error('Get chat room details error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CHAT_ROOM_FAILED',
            message: 'Failed to retrieve chat room details'
        });
    }
});

// Send message to chat room
router.post('/chat/rooms/:roomId/messages', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { roomId } = req.params;
        const { message, type = 'text' } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_MESSAGE',
                message: 'Message content is required'
            });
        }

        // Check if user is participant
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom || !chatRoom.isParticipant(userId)) {
            return res.status(403).json({
                success: false,
                error: 'ACCESS_DENIED',
                message: 'Access denied to this chat room'
            });
        }

        const chatMessage = await realTimeService.sendMessage(roomId, userId, message, type);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: chatMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: 'SEND_MESSAGE_FAILED',
            message: 'Failed to send message'
        });
    }
});

// Get chat messages
router.get('/chat/rooms/:roomId/messages', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { roomId } = req.params;
        const { limit = 50, offset = 0, before, after } = req.query;

        // Check if user is participant
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom || !chatRoom.isParticipant(userId)) {
            return res.status(403).json({
                success: false,
                error: 'ACCESS_DENIED',
                message: 'Access denied to this chat room'
            });
        }

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            before,
            after
        };

        const messages = await ChatMessage.findRoomMessages(roomId, options);

        res.json({
            success: true,
            message: 'Chat messages retrieved successfully',
            data: messages
        });
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MESSAGES_FAILED',
            message: 'Failed to retrieve chat messages'
        });
    }
});

// Mark messages as read
router.put('/chat/rooms/:roomId/messages/read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { roomId } = req.params;
        const { messageIds } = req.body;

        if (!messageIds || !Array.isArray(messageIds)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_MESSAGE_IDS',
                message: 'Message IDs array is required'
            });
        }

        // Check if user is participant
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom || !chatRoom.isParticipant(userId)) {
            return res.status(403).json({
                success: false,
                error: 'ACCESS_DENIED',
                message: 'Access denied to this chat room'
            });
        }

        await realTimeService.markMessagesAsRead(roomId, userId, messageIds);

        res.json({
            success: true,
            message: 'Messages marked as read successfully'
        });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({
            success: false,
            error: 'MARK_READ_FAILED',
            message: 'Failed to mark messages as read'
        });
    }
});

// Edit message
router.put('/chat/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_MESSAGE',
                message: 'Message content is required'
            });
        }

        const chatMessage = await ChatMessage.findById(messageId);
        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                error: 'MESSAGE_NOT_FOUND',
                message: 'Message not found'
            });
        }

        // Check if user is the sender
        if (chatMessage.senderId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'ACCESS_DENIED',
                message: 'You can only edit your own messages'
            });
        }

        chatMessage.editMessage(message);
        await chatMessage.save();

        // Emit message edited event
        realTimeService.emitToRoom(`chat:${chatMessage.roomId}`, 'message_edited', {
            messageId: chatMessage._id,
            message: chatMessage.message,
            editedAt: chatMessage.metadata.editedAt
        });

        res.json({
            success: true,
            message: 'Message edited successfully',
            data: chatMessage
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({
            success: false,
            error: 'EDIT_MESSAGE_FAILED',
            message: 'Failed to edit message'
        });
    }
});

// Delete message
router.delete('/chat/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;

        const chatMessage = await ChatMessage.findById(messageId);
        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                error: 'MESSAGE_NOT_FOUND',
                message: 'Message not found'
            });
        }

        // Check if user is the sender or has admin rights
        if (chatMessage.senderId.toString() !== userId) {
            // TODO: Add admin permission check
            return res.status(403).json({
                success: false,
                error: 'ACCESS_DENIED',
                message: 'You can only delete your own messages'
            });
        }

        chatMessage.deleteMessage(userId);
        await chatMessage.save();

        // Emit message deleted event
        realTimeService.emitToRoom(`chat:${chatMessage.roomId}`, 'message_deleted', {
            messageId: chatMessage._id,
            deletedBy: userId,
            deletedAt: chatMessage.deletedAt
        });

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            error: 'DELETE_MESSAGE_FAILED',
            message: 'Failed to delete message'
        });
    }
});

// Add reaction to message
router.post('/chat/messages/:messageId/reactions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EMOJI',
                message: 'Emoji is required'
            });
        }

        const chatMessage = await ChatMessage.findById(messageId);
        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                error: 'MESSAGE_NOT_FOUND',
                message: 'Message not found'
            });
        }

        chatMessage.addReaction(userId, emoji);
        await chatMessage.save();

        // Emit reaction added event
        realTimeService.emitToRoom(`chat:${chatMessage.roomId}`, 'reaction_added', {
            messageId: chatMessage._id,
            userId,
            emoji,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Reaction added successfully',
            data: {
                messageId: chatMessage._id,
                reactions: chatMessage.getReactionsGrouped()
            }
        });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({
            success: false,
            error: 'ADD_REACTION_FAILED',
            message: 'Failed to add reaction'
        });
    }
});

// Remove reaction from message
router.delete('/chat/messages/:messageId/reactions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;

        const chatMessage = await ChatMessage.findById(messageId);
        if (!chatMessage) {
            return res.status(404).json({
                success: false,
                error: 'MESSAGE_NOT_FOUND',
                message: 'Message not found'
            });
        }

        chatMessage.removeReaction(userId);
        await chatMessage.save();

        // Emit reaction removed event
        realTimeService.emitToRoom(`chat:${chatMessage.roomId}`, 'reaction_removed', {
            messageId: chatMessage._id,
            userId,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Reaction removed successfully',
            data: {
                messageId: chatMessage._id,
                reactions: chatMessage.getReactionsGrouped()
            }
        });
    } catch (error) {
        console.error('Remove reaction error:', error);
        res.status(500).json({
            success: false,
            error: 'REMOVE_REACTION_FAILED',
            message: 'Failed to remove reaction'
        });
    }
});

// ==================== UTILITY ROUTES ====================

// Get connected users count
router.get('/stats/connected-users', authenticateToken, async (req, res) => {
    try {
        const connectedUsers = realTimeService.getConnectedUsers();
        const socketCount = realTimeService.getSocketCount();

        res.json({
            success: true,
            message: 'Connection statistics retrieved successfully',
            data: {
                connectedUsers: connectedUsers.length,
                socketCount,
                connectedUserIds: connectedUsers
            }
        });
    } catch (error) {
        console.error('Get connection stats error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_STATS_FAILED',
            message: 'Failed to retrieve connection statistics'
        });
    }
});

// Emit custom event to user
router.post('/emit/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { event, data } = req.body;

        if (!event || !data) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EVENT_DATA',
                message: 'Event name and data are required'
            });
        }

        realTimeService.emitToUser(userId, event, data);

        res.json({
            success: true,
            message: 'Event emitted successfully'
        });
    } catch (error) {
        console.error('Emit event error:', error);
        res.status(500).json({
            success: false,
            error: 'EMIT_EVENT_FAILED',
            message: 'Failed to emit event'
        });
    }
});

// Emit custom event to all users
router.post('/emit/all', authenticateToken, async (req, res) => {
    try {
        const { event, data } = req.body;

        if (!event || !data) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EVENT_DATA',
                message: 'Event name and data are required'
            });
        }

        realTimeService.emitToAll(event, data);

        res.json({
            success: true,
            message: 'Event emitted to all users successfully'
        });
    } catch (error) {
        console.error('Emit event to all error:', error);
        res.status(500).json({
            success: false,
            error: 'EMIT_EVENT_FAILED',
            message: 'Failed to emit event to all users'
        });
    }
});

module.exports = router;
