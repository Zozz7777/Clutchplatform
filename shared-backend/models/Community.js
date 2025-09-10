const { getDb } = require('../config/database');

class Community {
  constructor() {
    this.collectionName = 'communities';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(communityData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...communityData,
        memberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      return result;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id, isActive: true });
    } catch (error) {
      console.error('Error finding community by ID:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      return result;
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  }

  async findByBrand(brand) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ 
        brand: { $regex: brand, $options: 'i' },
        isActive: true 
      }).toArray();
    } catch (error) {
      console.error('Error finding communities by brand:', error);
      throw error;
    }
  }

  async findPopularCommunities(limit = 10) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ 
        isActive: true 
      })
      .sort({ memberCount: -1 })
      .limit(limit)
      .toArray();
    } catch (error) {
      console.error('Error finding popular communities:', error);
      throw error;
    }
  }

  async joinCommunity(communityId, userId) {
    try {
      const collection = await this.getCollection();
      
      // Check if user is already a member
      const community = await this.findById(communityId);
      if (community.members && community.members.includes(userId)) {
        throw new Error('User is already a member of this community');
      }

      const result = await collection.updateOne(
        { _id: communityId },
        {
          $push: { members: userId },
          $inc: { memberCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );
      return result;
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  async leaveCommunity(communityId, userId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: communityId },
        {
          $pull: { members: userId },
          $inc: { memberCount: -1 },
          $set: { updatedAt: new Date() }
        }
      );
      return result;
    } catch (error) {
      console.error('Error leaving community:', error);
      throw error;
    }
  }

  async getUserCommunities(userId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({
        members: userId,
        isActive: true
      }).toArray();
    } catch (error) {
      console.error('Error finding user communities:', error);
      throw error;
    }
  }

  async createPost(communityId, postData) {
    try {
      const collection = await this.getCollection();
      const post = {
        _id: new Date().getTime().toString(),
        ...postData,
        createdAt: new Date(),
        likes: 0,
        comments: []
      };

      const result = await collection.updateOne(
        { _id: communityId },
        {
          $push: { posts: post },
          $set: { updatedAt: new Date() }
        }
      );
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async likePost(communityId, postId, userId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { 
          _id: communityId,
          'posts._id': postId
        },
        {
          $inc: { 'posts.$.likes': 1 },
          $push: { 'posts.$.likedBy': userId },
          $set: { updatedAt: new Date() }
        }
      );
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async commentOnPost(communityId, postId, commentData) {
    try {
      const collection = await this.getCollection();
      const comment = {
        _id: new Date().getTime().toString(),
        ...commentData,
        createdAt: new Date()
      };

      const result = await collection.updateOne(
        { 
          _id: communityId,
          'posts._id': postId
        },
        {
          $push: { 'posts.$.comments': comment },
          $set: { updatedAt: new Date() }
        }
      );
      return result;
    } catch (error) {
      console.error('Error commenting on post:', error);
      throw error;
    }
  }

  async getCommunityPosts(communityId, limit = 20, offset = 0) {
    try {
      const collection = await this.getCollection();
      const community = await this.findById(communityId);
      
      if (!community || !community.posts) {
        return [];
      }

      // Sort posts by creation date and apply pagination
      const sortedPosts = community.posts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);

      return sortedPosts;
    } catch (error) {
      console.error('Error getting community posts:', error);
      throw error;
    }
  }

  async searchCommunities(searchTerm) {
    try {
      const collection = await this.getCollection();
      return await collection.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } },
              { brand: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }).toArray();
    } catch (error) {
      console.error('Error searching communities:', error);
      throw error;
    }
  }

  async getCommunityStats(communityId) {
    try {
      const collection = await this.getCollection();
      const community = await this.findById(communityId);
      
      if (!community) {
        throw new Error('Community not found');
      }

      const stats = {
        memberCount: community.memberCount || 0,
        postCount: community.posts ? community.posts.length : 0,
        totalLikes: 0,
        totalComments: 0,
        activeMembers: 0
      };

      if (community.posts) {
        community.posts.forEach(post => {
          stats.totalLikes += post.likes || 0;
          stats.totalComments += post.comments ? post.comments.length : 0;
        });
      }

      // Calculate active members (members who posted in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (community.posts) {
        const recentPosters = new Set();
        community.posts.forEach(post => {
          if (new Date(post.createdAt) > thirtyDaysAgo) {
            recentPosters.add(post.authorId);
          }
        });
        stats.activeMembers = recentPosters.size;
      }

      return stats;
    } catch (error) {
      console.error('Error getting community stats:', error);
      throw error;
    }
  }
}

module.exports = new Community();
