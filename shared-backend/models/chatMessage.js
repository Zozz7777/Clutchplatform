const mongoose = require('../shims/mongoose');

const chatMessageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'voice', 'video', 'location', 'system'],
        default: 'text'
    },
    metadata: {
        fileName: String,
        fileSize: Number,
        fileType: String,
        fileUrl: String,
        thumbnailUrl: String,
        duration: Number, // For voice/video messages
        latitude: Number,
        longitude: Number,
        locationName: String,
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatMessage'
        },
        editedAt: Date,
        editHistory: [{
            message: String,
            editedAt: Date
        }]
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    deliveredTo: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deliveredAt: {
            type: Date,
            default: Date.now
        }
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    timestamp: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
chatMessageSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for efficient querying
chatMessageSchema.index({ roomId: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1 });
chatMessageSchema.index({ type: 1 });
chatMessageSchema.index({ isDeleted: 1 });
chatMessageSchema.index({ timestamp: -1 });

// Compound indexes for common query patterns
chatMessageSchema.index({ roomId: 1, isDeleted: 1 });
chatMessageSchema.index({ senderId: 1, timestamp: -1 });

// TTL index to automatically delete old messages after 2 years
chatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

// Virtual for checking if message is read by a specific user
chatMessageSchema.virtual('isReadByUser').get(function(userId) {
    return this.readBy.some(read => read.userId.toString() === userId.toString());
});

// Virtual for checking if message is delivered to a specific user
chatMessageSchema.virtual('isDeliveredToUser').get(function(userId) {
    return this.deliveredTo.some(delivered => delivered.userId.toString() === userId.toString());
});

// Method to mark message as read by user
chatMessageSchema.methods.markAsRead = function(userId) {
    if (!this.isReadByUser(userId)) {
        this.readBy.push({
            userId,
            readAt: new Date()
        });
    }
    return this;
};

// Method to mark message as delivered to user
chatMessageSchema.methods.markAsDelivered = function(userId) {
    if (!this.isDeliveredToUser(userId)) {
        this.deliveredTo.push({
            userId,
            deliveredAt: new Date()
        });
    }
    return this;
};

// Method to add reaction
chatMessageSchema.methods.addReaction = function(userId, emoji) {
    // Remove existing reaction from this user
    this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
    
    // Add new reaction
    this.reactions.push({
        userId,
        emoji,
        timestamp: new Date()
    });
    
    return this;
};

// Method to remove reaction
chatMessageSchema.methods.removeReaction = function(userId) {
    this.reactions = this.reactions.filter(r => r.userId.toString() !== userId.toString());
    return this;
};

// Method to edit message
chatMessageSchema.methods.editMessage = function(newMessage) {
    // Store edit history
    if (!this.metadata.editHistory) {
        this.metadata.editHistory = [];
    }
    
    this.metadata.editHistory.push({
        message: this.message,
        editedAt: new Date()
    });
    
    // Update message
    this.message = newMessage;
    this.isEdited = true;
    this.metadata.editedAt = new Date();
    
    return this;
};

// Method to delete message
chatMessageSchema.methods.deleteMessage = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    return this;
};

// Method to get reaction count for specific emoji
chatMessageSchema.methods.getReactionCount = function(emoji) {
    return this.reactions.filter(r => r.emoji === emoji).length;
};

// Method to get all reactions grouped by emoji
chatMessageSchema.methods.getReactionsGrouped = function() {
    const grouped = {};
    this.reactions.forEach(reaction => {
        if (!grouped[reaction.emoji]) {
            grouped[reaction.emoji] = [];
        }
        grouped[reaction.emoji].push(reaction.userId);
    });
    return grouped;
};

// Static method to find messages in room
chatMessageSchema.statics.findRoomMessages = function(roomId, options = {}) {
    const query = {
        roomId,
        isDeleted: false
    };

    if (options.before) {
        query.timestamp = { $lt: new Date(options.before) };
    }

    if (options.after) {
        query.timestamp = { $gt: new Date(options.after) };
    }

    return this.find(query)
        .populate('senderId', 'fullName email profilePicture')
        .populate('metadata.replyTo', 'message senderId')
        .populate('readBy.userId', 'fullName')
        .populate('reactions.userId', 'fullName')
        .sort({ timestamp: -1 })
        .limit(options.limit || 50);
};

// Static method to find unread messages for user
chatMessageSchema.statics.findUnreadMessages = function(userId, roomId) {
    return this.find({
        roomId,
        senderId: { $ne: userId },
        isDeleted: false,
        'readBy.userId': { $ne: userId }
    }).sort({ timestamp: -1 });
};

// Static method to mark messages as read
chatMessageSchema.statics.markMessagesAsRead = function(messageIds, userId) {
    return this.updateMany(
        { _id: { $in: messageIds } },
        { 
            $addToSet: { 
                readBy: { 
                    userId, 
                    readAt: new Date() 
                } 
            } 
        }
    );
};

// Static method to mark messages as delivered
chatMessageSchema.statics.markMessagesAsDelivered = function(messageIds, userId) {
    return this.updateMany(
        { _id: { $in: messageIds } },
        { 
            $addToSet: { 
                deliveredTo: { 
                    userId, 
                    deliveredAt: new Date() 
                } 
            } 
        }
    );
};

// Static method to get message statistics
chatMessageSchema.statics.getMessageStats = function(roomId, timeRange = {}) {
    const query = { roomId, isDeleted: false };
    
    if (timeRange.start) {
        query.timestamp = { $gte: new Date(timeRange.start) };
    }
    
    if (timeRange.end) {
        query.timestamp = { ...query.timestamp, $lte: new Date(timeRange.end) };
    }

    return this.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalMessages: { $sum: 1 },
                uniqueSenders: { $addToSet: '$senderId' },
                messageTypes: { $addToSet: '$type' }
            }
        },
        {
            $project: {
                totalMessages: 1,
                uniqueSenders: { $size: '$uniqueSenders' },
                messageTypes: 1
            }
        }
    ]);
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
