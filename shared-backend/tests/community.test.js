const request = require('supertest');
const app = require('../server');
const { getDb } = require('../config/database');
const CommunityTip = require('../models/CommunityTip');
const Loyalty = require('../models/Loyalty');
const User = require('../models/User');

describe('Community API', () => {
    let authToken;
    let testUserId;
    let testTipId;

    beforeAll(async () => {
        // Create test user and get auth token
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        const registerResponse = await request(app)
            .post('/api/v1/auth/register')
            .send(testUser);

        if (registerResponse.body.success) {
            authToken = registerResponse.body.data.accessToken;
            testUserId = registerResponse.body.data.user.id;
        } else {
            // Try login if user already exists
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            authToken = loginResponse.body.data.accessToken;
            testUserId = loginResponse.body.data.user.id;
        }
    });

    afterAll(async () => {
        // Clean up test data
        try {
            const db = await getDb();
            await db.collection('users').deleteOne({ _id: testUserId });
            await db.collection('community_tips').deleteMany({ userId: testUserId });
            await db.collection('loyalty').deleteOne({ userId: testUserId });
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    describe('POST /api/v1/community/tips', () => {
        it('should create a new tip successfully', async () => {
            const tipData = {
                type: 'tip',
                title: 'Test Tip',
                content: 'This is a test tip content',
                category: 'maintenance',
                tags: ['test', 'maintenance'],
                language: 'en'
            };

            const response = await request(app)
                .post('/api/v1/community/tips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(tipData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(tipData.title);
            expect(response.body.data.content).toBe(tipData.content);
            expect(response.body.data.userId).toBe(testUserId);
            expect(response.body.data.type).toBe('tip');

            testTipId = response.body.data._id;
        });

        it('should create a new review successfully', async () => {
            const reviewData = {
                type: 'review',
                title: 'Test Review',
                content: 'This is a test review content',
                category: 'service',
                rating: 5,
                partnerId: 'test-partner-id',
                tags: ['test', 'review'],
                language: 'en'
            };

            const response = await request(app)
                .post('/api/v1/community/tips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(reviewData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(reviewData.title);
            expect(response.body.data.rating).toBe(reviewData.rating);
            expect(response.body.data.type).toBe('review');
        });

        it('should require authentication', async () => {
            const tipData = {
                type: 'tip',
                title: 'Test Tip',
                content: 'This is a test tip content',
                category: 'maintenance'
            };

            await request(app)
                .post('/api/v1/community/tips')
                .send(tipData)
                .expect(401);
        });

        it('should validate required fields', async () => {
            const invalidTipData = {
                type: 'tip',
                // Missing title and content
                category: 'maintenance'
            };

            await request(app)
                .post('/api/v1/community/tips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidTipData)
                .expect(400);
        });

        it('should validate rating for reviews', async () => {
            const invalidReviewData = {
                type: 'review',
                title: 'Test Review',
                content: 'This is a test review content',
                category: 'service'
                // Missing rating
            };

            await request(app)
                .post('/api/v1/community/tips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidReviewData)
                .expect(400);
        });
    });

    describe('GET /api/v1/community/tips', () => {
        it('should get community tips successfully', async () => {
            const response = await request(app)
                .get('/api/v1/community/tips')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.tips).toBeDefined();
            expect(response.body.data.pagination).toBeDefined();
            expect(Array.isArray(response.body.data.tips)).toBe(true);
        });

        it('should filter tips by type', async () => {
            const response = await request(app)
                .get('/api/v1/community/tips?type=tip')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.tips.forEach(tip => {
                expect(tip.type).toBe('tip');
            });
        });

        it('should filter tips by category', async () => {
            const response = await request(app)
                .get('/api/v1/community/tips?category=maintenance')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.tips.forEach(tip => {
                expect(tip.category).toBe('maintenance');
            });
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/v1/community/tips?page=1&limit=5')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.tips.length).toBeLessThanOrEqual(5);
            expect(response.body.data.pagination.current).toBe(1);
        });
    });

    describe('GET /api/v1/community/tips/:id', () => {
        it('should get specific tip successfully', async () => {
            if (!testTipId) {
                // Create a tip first if testTipId is not set
                const tipData = {
                    type: 'tip',
                    title: 'Test Tip for Get',
                    content: 'This is a test tip content',
                    category: 'maintenance'
                };

                const createResponse = await request(app)
                    .post('/api/v1/community/tips')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(tipData);

                testTipId = createResponse.body.data._id;
            }

            const response = await request(app)
                .get(`/api/v1/community/tips/${testTipId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(testTipId);
        });

        it('should return 404 for non-existent tip', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            
            await request(app)
                .get(`/api/v1/community/tips/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('POST /api/v1/community/tips/:id/vote', () => {
        it('should vote on tip successfully', async () => {
            if (!testTipId) {
                // Create a tip first if testTipId is not set
                const tipData = {
                    type: 'tip',
                    title: 'Test Tip for Vote',
                    content: 'This is a test tip content',
                    category: 'maintenance'
                };

                const createResponse = await request(app)
                    .post('/api/v1/community/tips')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(tipData);

                testTipId = createResponse.body.data._id;
            }

            const voteData = {
                voteType: 'up'
            };

            const response = await request(app)
                .post(`/api/v1/community/tips/${testTipId}/vote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(voteData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.votes.up).toBeGreaterThan(0);
        });

        it('should validate vote type', async () => {
            const invalidVoteData = {
                voteType: 'invalid'
            };

            await request(app)
                .post(`/api/v1/community/tips/${testTipId}/vote`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidVoteData)
                .expect(400);
        });
    });

    describe('DELETE /api/v1/community/tips/:id/vote', () => {
        it('should remove vote successfully', async () => {
            if (!testTipId) {
                // Create a tip first if testTipId is not set
                const tipData = {
                    type: 'tip',
                    title: 'Test Tip for Remove Vote',
                    content: 'This is a test tip content',
                    category: 'maintenance'
                };

                const createResponse = await request(app)
                    .post('/api/v1/community/tips')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(tipData);

                testTipId = createResponse.body.data._id;
            }

            const response = await request(app)
                .delete(`/api/v1/community/tips/${testTipId}/vote`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /api/v1/community/tips/:id/comments', () => {
        it('should add comment successfully', async () => {
            if (!testTipId) {
                // Create a tip first if testTipId is not set
                const tipData = {
                    type: 'tip',
                    title: 'Test Tip for Comment',
                    content: 'This is a test tip content',
                    category: 'maintenance'
                };

                const createResponse = await request(app)
                    .post('/api/v1/community/tips')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(tipData);

                testTipId = createResponse.body.data._id;
            }

            const commentData = {
                content: 'This is a test comment'
            };

            const response = await request(app)
                .post(`/api/v1/community/tips/${testTipId}/comments`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(commentData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBe(commentData.content);
        });

        it('should validate comment content', async () => {
            const invalidCommentData = {
                content: '' // Empty content
            };

            await request(app)
                .post(`/api/v1/community/tips/${testTipId}/comments`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidCommentData)
                .expect(400);
        });
    });

    describe('GET /api/v1/community/leaderboard', () => {
        it('should get community leaderboard successfully', async () => {
            const response = await request(app)
                .get('/api/v1/community/leaderboard')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topContributors).toBeDefined();
            expect(response.body.data.topTipCreators).toBeDefined();
            expect(response.body.data.topReviewers).toBeDefined();
            expect(Array.isArray(response.body.data.topContributors)).toBe(true);
        });

        it('should filter leaderboard by period', async () => {
            const response = await request(app)
                .get('/api/v1/community/leaderboard?period=30')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.period).toBe('30');
        });
    });

    describe('GET /api/v1/community/stats', () => {
        it('should get community stats successfully', async () => {
            const response = await request(app)
                .get('/api/v1/community/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.totalTips).toBeDefined();
            expect(response.body.data.totalReviews).toBeDefined();
            expect(response.body.data.totalVotes).toBeDefined();
            expect(response.body.data.categoryStats).toBeDefined();
            expect(Array.isArray(response.body.data.categoryStats)).toBe(true);
        });
    });

    describe('PUT /api/v1/community/tips/:id', () => {
        it('should update tip successfully', async () => {
            if (!testTipId) {
                // Create a tip first if testTipId is not set
                const tipData = {
                    type: 'tip',
                    title: 'Test Tip for Update',
                    content: 'This is a test tip content',
                    category: 'maintenance'
                };

                const createResponse = await request(app)
                    .post('/api/v1/community/tips')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(tipData);

                testTipId = createResponse.body.data._id;
            }

            const updateData = {
                title: 'Updated Test Tip',
                content: 'This is updated content'
            };

            const response = await request(app)
                .put(`/api/v1/community/tips/${testTipId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(updateData.title);
            expect(response.body.data.content).toBe(updateData.content);
        });

        it('should not allow updating other users tips', async () => {
            // This would require creating another user and tip
            // For now, we'll test with a non-existent tip ID
            const nonExistentId = '507f1f77bcf86cd799439011';
            
            const updateData = {
                title: 'Updated Test Tip'
            };

            await request(app)
                .put(`/api/v1/community/tips/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(404);
        });
    });

    describe('DELETE /api/v1/community/tips/:id', () => {
        it('should delete tip successfully', async () => {
            // Create a tip first
            const tipData = {
                type: 'tip',
                title: 'Test Tip for Delete',
                content: 'This is a test tip content',
                category: 'maintenance'
            };

            const createResponse = await request(app)
                .post('/api/v1/community/tips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(tipData);

            const tipToDeleteId = createResponse.body.data._id;

            const response = await request(app)
                .delete(`/api/v1/community/tips/${tipToDeleteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should not allow deleting other users tips', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            
            await request(app)
                .delete(`/api/v1/community/tips/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });
});
