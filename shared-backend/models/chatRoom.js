const mongoose = require('../shims/mongoose');

const chatRoomSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    type: {
        type: String,
        enum: ['direct', 'group', 'support', 'booking'],
        default: 'direct'
    },
    name: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastMessage: {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatMessage'
        },
        content: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    settings: {
        allowFileSharing: {
            type: Boolean,
            default: true
        },
        allowVoiceMessages: {
            type: Boolean,
            default: true
        },
        allowVideoCalls: {
            type: Boolean,
            default: false
        },
        maxParticipants: {
            type: Number,
            default: 10
        }
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
chatRoomSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for efficient querying
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ type: 1 });
chatRoomSchema.index({ isActive: 1 });
chatRoomSchema.index({ 'lastMessage.timestamp': -1 });
chatRoomSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
chatRoomSchema.index({ participants: 1, type: 1 });
chatRoomSchema.index({ participants: 1, isActive: 1 });

// Virtual for checking if room is a direct chat
chatRoomSchema.virtual('isDirectChat').get(function() {
    return this.type === 'direct' && this.participants.length === 2;
});

// Virtual for checking if room is a group chat
chatRoomSchema.virtual('isGroupChat').get(function() {
    return this.type === 'group' && this.participants.length > 2;
});

// Method to add participant to room
chatRoomSchema.methods.addParticipant = function(userId) {
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
    }
    return this;
};

// Method to remove participant from room
chatRoomSchema.methods.removeParticipant = function(userId) {
    this.participants = this.participants.filter(p => p.toString() !== userId.toString());
    return this;
};

// Method to check if user is participant
chatRoomSchema.methods.isParticipant = function(userId) {
    return this.participants.some(p => p.toString() === userId.toString());
};

// Method to update last message
chatRoomSchema.methods.updateLastMessage = function(messageId, content, senderId) {
    this.lastMessage = {
        messageId,
        content,
        senderId,
        timestamp: new Date()
    };
    return this;
};

// Method to increment unread count for user
chatRoomSchema.methods.incrementUnreadCount = function(userId) {
    const currentCount = this.unreadCount.get(userId.toString()) || 0;
    this.unreadCount.set(userId.toString(), currentCount + 1);
    return this;
};

// Method to reset unread count for user
chatRoomSchema.methods.resetUnreadCount = function(userId) {
    this.unreadCount.set(userId.toString(), 0);
    return this;
};

// Static method to find direct chat between two users
chatRoomSchema.statics.findDirectChat = function(userId1, userId2) {
    return this.findOne({
        type: 'direct',
        participants: { $all: [userId1, userId2] },
        isActive: true
    });
};

// Static method to find user's chat rooms
chatRoomSchema.statics.findUserRooms = function(userId, options = {}) {
    const query = {
        participants: userId,
        isActive: true
    };

    if (options.type) {
        query.type = options.type;
    }

    return this.find(query)
        .populate('participants', 'fullName email profilePicture')
        .populate('lastMessage.senderId', 'fullName')
        .sort({ 'lastMessage.timestamp': -1, createdAt: -1 });
};

// Static method to create direct chat
chatRoomSchema.statics.createDirectChat = function(userId1, userId2) {
    return this.create({
        participants: [userId1, userId2],
        type: 'direct',
        isActive: true
    });
};

// Static method to create group chat
chatRoomSchema.statics.createGroupChat = function(participants, name, description = '') {
    return this.create({
        participants,
        type: 'group',
        name,
        description,
        isActive: true
    });
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
