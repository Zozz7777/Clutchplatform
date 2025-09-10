const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { ObjectId } = require('mongodb');

// Get all communities
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status } = req.query;
        const skip = (page - 1) * limit;
        
        const filters = {};
        if (category) filters.category = category;
        if (status) filters.status = status;

        const collection = await getCollection('communities');
        const communities = await collection.find(filters)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .toArray();
        
        const total = await collection.countDocuments(filters);

        res.json({
            success: true,
            data: communities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get communities error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_COMMUNITIES_FAILED',
            message: 'Failed to retrieve communities'
        });
    }
});

// Get community by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await getCollection('communities');
        const community = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!community) {
            return res.status(404).json({
                success: false,
                error: 'COMMUNITY_NOT_FOUND',
                message: 'Community not found'
            });
        }

        res.json({
            success: true,
            data: community
        });
    } catch (error) {
        console.error('Get community error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_COMMUNITY_FAILED',
            message: 'Failed to retrieve community'
        });
    }
});

// Create community
router.post('/', authenticateToken, async (req, res) => {
    try {
        const communityData = {
            ...req.body,
            createdBy: req.user.userId,
            status: 'active',
            members: [req.user.userId],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const collection = await getCollection('communities');
        const result = await collection.insertOne(communityData);
        
        communityData._id = result.insertedId;

        res.status(201).json({
            success: true,
            message: 'Community created successfully',
            data: communityData
        });
    } catch (error) {
        console.error('Create community error:', error);
        res.status(500).json({
            success: false,
            error: 'CREATE_COMMUNITY_FAILED',
            message: 'Failed to create community'
        });
    }
});

// Update community
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const collection = await getCollection('communities');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'COMMUNITY_NOT_FOUND',
                message: 'Community not found'
            });
        }

        res.json({
            success: true,
            message: 'Community updated successfully'
        });
    } catch (error) {
        console.error('Update community error:', error);
        res.status(500).json({
            success: false,
            error: 'UPDATE_COMMUNITY_FAILED',
            message: 'Failed to update community'
        });
    }
});

// Join community
router.post('/:id/join', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        const collection = await getCollection('communities');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $addToSet: { members: userId },
                $set: { updatedAt: new Date() }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'COMMUNITY_NOT_FOUND',
                message: 'Community not found'
            });
        }

        res.json({
            success: true,
            message: 'Joined community successfully'
        });
    } catch (error) {
        console.error('Join community error:', error);
        res.status(500).json({
            success: false,
            error: 'JOIN_COMMUNITY_FAILED',
            message: 'Failed to join community'
        });
    }
});

// Leave community
router.post('/:id/leave', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        const collection = await getCollection('communities');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $pull: { members: userId },
                $set: { updatedAt: new Date() }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'COMMUNITY_NOT_FOUND',
                message: 'Community not found'
            });
        }

        res.json({
            success: true,
            message: 'Left community successfully'
        });
    } catch (error) {
        console.error('Leave community error:', error);
        res.status(500).json({
            success: false,
            error: 'LEAVE_COMMUNITY_FAILED',
            message: 'Failed to leave community'
        });
    }
});

module.exports = router;
