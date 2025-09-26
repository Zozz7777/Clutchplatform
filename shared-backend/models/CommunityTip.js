const mongoose = require('mongoose');

const communityTipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['tip', 'review'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  category: {
    type: String,
    enum: ['maintenance', 'parts', 'driving', 'safety', 'fuel', 'general'],
    required: true,
    index: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  votes: {
    up: {
      type: Number,
      default: 0
    },
    down: {
      type: Number,
      default: 0
    },
    users: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      voteType: {
        type: String,
        enum: ['up', 'down']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    default: null
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    }
  }],
  language: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
communityTipSchema.index({ createdAt: -1 });
communityTipSchema.index({ 'votes.up': -1 });
communityTipSchema.index({ category: 1, createdAt: -1 });
communityTipSchema.index({ isApproved: 1, isFeatured: 1 });
communityTipSchema.index({ tags: 1 });

// Virtual for total votes
communityTipSchema.virtual('totalVotes').get(function() {
  return this.votes.up - this.votes.down;
});

// Virtual for vote percentage
communityTipSchema.virtual('votePercentage').get(function() {
  const total = this.votes.up + this.votes.down;
  if (total === 0) return 0;
  return Math.round((this.votes.up / total) * 100);
});

// Pre-save middleware
communityTipSchema.pre('save', function(next) {
  // Update vote counts from users array
  this.votes.up = this.votes.users.filter(v => v.voteType === 'up').length;
  this.votes.down = this.votes.users.filter(v => v.voteType === 'down').length;
  next();
});

// Methods
communityTipSchema.methods.addVote = function(userId, voteType) {
  // Remove existing vote
  this.votes.users = this.votes.users.filter(v => !v.userId.equals(userId));
  
  // Add new vote
  this.votes.users.push({
    userId,
    voteType,
    votedAt: new Date()
  });
  
  return this.save();
};

communityTipSchema.methods.removeVote = function(userId) {
  this.votes.users = this.votes.users.filter(v => !v.userId.equals(userId));
  return this.save();
};

communityTipSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    userId,
    content,
    createdAt: new Date()
  });
  return this.save();
};

communityTipSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

communityTipSchema.methods.incrementShareCount = function() {
  this.shareCount += 1;
  return this.save();
};

module.exports = mongoose.model('CommunityTip', communityTipSchema);
