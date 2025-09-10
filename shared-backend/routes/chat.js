const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all chat rooms
router.get('/rooms', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = { participants: req.user.userId };
        if (type) filters.type = type;

        const collection = await getCollection('chat_rooms');
        const rooms = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ lastMessageAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: rooms,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
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

// Get chat room by ID
router.get('/rooms/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('chat_rooms');
        const room = await collection.findOne({ 
            _id: new ObjectId(id),
            participants: req.user.userId
        });
        
        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'CHAT_ROOM_NOT_FOUND',
                message: 'Chat room not found'
            });
        }

        res.json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Get chat room error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CHAT_ROOM_FAILED',
            message: 'Failed to retrieve chat room'
        });
    }
});

// Create chat room
router.post('/rooms', authenticateToken, async (req, res) => {
    try {
        const { participants, type = 'direct', name } = req.body;
        
        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_PARTICIPANTS',
                message: 'Participants array is required'
            });
        }

        // Add current user to participants if not already included
        if (!participants.includes(req.user.userId)) {
            participants.push(req.user.userId);
        }

        const roomData = {
            participants,
            type,
            name,
            createdBy: req.user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('chat_rooms');
        const result = await collection.insertOne(roomData);
        
        roomData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Chat room created successfully',
            data: roomData
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

// Get messages for a chat room
router.get('/rooms/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        // Verify user has access to this chat room
        const roomCollection = await getCollection('chat_rooms');
        const room = await roomCollection.findOne({ 
            _id: new ObjectId(id),
            participants: req.user.userId
        });
        
        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'CHAT_ROOM_NOT_FOUND',
                message: 'Chat room not found'
            });
        }

        const messagesCollection = await getCollection('chat_messages');
        const messages = await messagesCollection.find({ roomId: new ObjectId(id) })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await messagesCollection.countDocuments({ roomId: new ObjectId(id) });

        res.json({
            success: true,
            data: messages.reverse(), // Return in chronological order
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_MESSAGES_FAILED',
            message: 'Failed to retrieve messages'
        });
    }
});

// Send message
router.post('/rooms/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, type = 'text' } = req.body;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_CONTENT',
                message: 'Message content is required'
            });
        }

        // Verify user has access to this chat room
        const roomCollection = await getCollection('chat_rooms');
        const room = await roomCollection.findOne({ 
            _id: new ObjectId(id),
            participants: req.user.userId
        });
        
        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'CHAT_ROOM_NOT_FOUND',
                message: 'Chat room not found'
            });
        }

        const messageData = {
            roomId: new ObjectId(id),
            senderId: req.user.userId,
            content,
            type,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const messagesCollection = await getCollection('chat_messages');
        const result = await messagesCollection.insertOne(messageData);
        
        messageData._id = result.insertedId;

        // Update chat room's last message
        await roomCollection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    lastMessage: content,
                    lastMessageAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: messageData
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

// Mark messages as read
router.post('/rooms/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const messagesCollection = await getCollection('chat_messages');
        const result = await messagesCollection.updateMany(
            { 
                roomId: new ObjectId(id),
                senderId: { $ne: req.user.userId },
                readBy: { $ne: req.user.userId }
            },
            { 
                $addToSet: { readBy: req.user.userId },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Messages marked as read',
            data: { updatedCount: result.modifiedCount }
        });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({
            success: false,
            error: 'MARK_MESSAGES_READ_FAILED',
            message: 'Failed to mark messages as read'
        });
    }
});

// Get all chat users (employees)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const { search, department, role } = req.query;
        
        // Build filters
        const filters = {};
        if (search) {
            filters.$or = [
                { 'basicInfo.firstName': { $regex: search, $options: 'i' } },
                { 'basicInfo.lastName': { $regex: search, $options: 'i' } },
                { 'basicInfo.email': { $regex: search, $options: 'i' } }
            ];
        }
        if (department) filters['employment.department'] = department;
        if (role) filters['employment.role'] = role;

        const collection = await getCollection('employees');
        const users = await collection.find(filters, {
            projection: {
                _id: 1,
                'basicInfo.firstName': 1,
                'basicInfo.lastName': 1,
                'basicInfo.email': 1,
                'employment.department': 1,
                'employment.role': 1,
                status: 1,
                'profile.avatar': 1
            }
        }).toArray();

        const chatUsers = users.map(user => ({
            id: user._id.toString(),
            name: `${user.basicInfo.firstName || ''} ${user.basicInfo.lastName || ''}`.trim(),
            email: user.basicInfo.email,
            role: user.employment?.role || 'Employee',
            department: user.employment?.department || 'General',
            status: user.status || 'offline',
            avatar: user.profile?.avatar || null
        }));

        res.json({
            success: true,
            data: chatUsers
        });
    } catch (error) {
        console.error('Get chat users error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_CHAT_USERS_FAILED',
            message: 'Failed to retrieve chat users'
        });
    }
});

module.exports = router;
