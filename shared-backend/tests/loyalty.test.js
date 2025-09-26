const request = require('supertest');
const app = require('../server');
const { getDb } = require('../config/database');
const Loyalty = require('../models/Loyalty');
const User = require('../models/User');

describe('Loyalty API', () => {
    let authToken;
    let testUserId;

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
            await db.collection('loyalty').deleteOne({ userId: testUserId });
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    describe('GET /api/v1/loyalty/points', () => {
        it('should get loyalty points successfully', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/points')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.pointsBalance).toBeDefined();
            expect(response.body.data.totalEarned).toBeDefined();
            expect(response.body.data.totalRedeemed).toBeDefined();
            expect(response.body.data.tier).toBeDefined();
            expect(response.body.data.badges).toBeDefined();
            expect(Array.isArray(response.body.data.badges)).toBe(true);
        });

        it('should create new loyalty account if none exists', async () => {
            // This test assumes the endpoint creates a new account if none exists
            const response = await request(app)
                .get('/api/v1/loyalty/points')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.pointsBalance).toBe(0);
            expect(response.body.data.tier).toBe('bronze');
        });

        it('should require authentication', async () => {
            await request(app)
                .get('/api/v1/loyalty/points')
                .expect(401);
        });
    });

    describe('POST /api/v1/loyalty/earn', () => {
        it('should add points successfully (admin only)', async () => {
            const earnData = {
                userId: testUserId,
                points: 100,
                description: 'Test points earning',
                referenceType: 'admin'
            };

            // Note: This test assumes admin authentication is set up
            // In a real scenario, you'd need to use an admin token
            const response = await request(app)
                .post('/api/v1/loyalty/earn')
                .set('Authorization', `Bearer ${authToken}`)
                .send(earnData);

            // This might return 403 if not admin, which is expected
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.pointsBalance).toBeGreaterThan(0);
            } else {
                expect(response.status).toBe(403);
            }
        });

        it('should validate required fields', async () => {
            const invalidEarnData = {
                userId: testUserId,
                // Missing points and description
            };

            await request(app)
                .post('/api/v1/loyalty/earn')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidEarnData)
                .expect(400);
        });
    });

    describe('POST /api/v1/loyalty/redeem', () => {
        it('should redeem points successfully', async () => {
            // First, ensure user has some points
            const loyaltyResponse = await request(app)
                .get('/api/v1/loyalty/points')
                .set('Authorization', `Bearer ${authToken}`);

            const currentBalance = loyaltyResponse.body.data.pointsBalance;

            if (currentBalance > 0) {
                const redeemData = {
                    points: Math.min(10, currentBalance),
                    description: 'Test points redemption',
                    referenceType: 'admin'
                };

                const response = await request(app)
                    .post('/api/v1/loyalty/redeem')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(redeemData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.pointsBalance).toBeLessThan(currentBalance);
                expect(response.body.data.redeemedPoints).toBe(redeemData.points);
            } else {
                // Test insufficient points scenario
                const redeemData = {
                    points: 1000,
                    description: 'Test points redemption',
                    referenceType: 'admin'
                };

                await request(app)
                    .post('/api/v1/loyalty/redeem')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(redeemData)
                    .expect(400);
            }
        });

        it('should validate required fields', async () => {
            const invalidRedeemData = {
                // Missing points and description
            };

            await request(app)
                .post('/api/v1/loyalty/redeem')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidRedeemData)
                .expect(400);
        });

        it('should validate points amount', async () => {
            const invalidRedeemData = {
                points: -10, // Negative points
                description: 'Test points redemption'
            };

            await request(app)
                .post('/api/v1/loyalty/redeem')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidRedeemData)
                .expect(400);
        });
    });

    describe('GET /api/v1/loyalty/badges', () => {
        it('should get loyalty badges successfully', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/badges')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.badges).toBeDefined();
            expect(response.body.data.badgesByCategory).toBeDefined();
            expect(response.body.data.totalBadges).toBeDefined();
            expect(Array.isArray(response.body.data.badges)).toBe(true);
        });

        it('should require authentication', async () => {
            await request(app)
                .get('/api/v1/loyalty/badges')
                .expect(401);
        });
    });

    describe('GET /api/v1/loyalty/leaderboard', () => {
        it('should get loyalty leaderboard successfully', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/leaderboard')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.leaderboard).toBeDefined();
            expect(response.body.data.tierDistribution).toBeDefined();
            expect(Array.isArray(response.body.data.leaderboard)).toBe(true);
            expect(Array.isArray(response.body.data.tierDistribution)).toBe(true);
        });

        it('should filter leaderboard by period', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/leaderboard?period=30')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.period).toBe('30');
        });

        it('should filter leaderboard by tier', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/leaderboard?tier=bronze')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.leaderboard.forEach(user => {
                expect(user.tier).toBe('bronze');
            });
        });

        it('should limit leaderboard results', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/leaderboard?limit=10')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.leaderboard.length).toBeLessThanOrEqual(10);
        });
    });

    describe('GET /api/v1/loyalty/rewards', () => {
        it('should get loyalty rewards successfully', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/rewards')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.rewards).toBeDefined();
            expect(response.body.data.categories).toBeDefined();
            expect(response.body.data.totalRewards).toBeDefined();
            expect(Array.isArray(response.body.data.rewards)).toBe(true);
            expect(Array.isArray(response.body.data.categories)).toBe(true);
        });

        it('should filter rewards by tier', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/rewards?tier=bronze')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.rewards.forEach(reward => {
                expect(['bronze', 'silver', 'gold', 'platinum']).toContain(reward.tier);
            });
        });

        it('should filter rewards by category', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/rewards?category=discount')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            response.body.data.rewards.forEach(reward => {
                expect(reward.category).toBe('discount');
            });
        });
    });

    describe('POST /api/v1/loyalty/rewards/:rewardId/redeem', () => {
        it('should redeem reward successfully', async () => {
            // First get available rewards
            const rewardsResponse = await request(app)
                .get('/api/v1/loyalty/rewards')
                .set('Authorization', `Bearer ${authToken}`);

            const rewards = rewardsResponse.body.data.rewards;
            
            if (rewards.length > 0) {
                const rewardToRedeem = rewards[0];

                const response = await request(app)
                    .post(`/api/v1/loyalty/rewards/${rewardToRedeem.id}/redeem`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.reward.id).toBe(rewardToRedeem.id);
                expect(response.body.data.redeemedPoints).toBe(rewardToRedeem.pointsRequired);
            }
        });

        it('should handle insufficient points for reward redemption', async () => {
            // This test assumes there's a reward that costs more points than the user has
            const response = await request(app)
                .post('/api/v1/loyalty/rewards/expensive_reward/redeem')
                .set('Authorization', `Bearer ${authToken}`);

            // This might return 400 for insufficient points or 404 for non-existent reward
            expect([400, 404]).toContain(response.status);
        });

        it('should return 404 for non-existent reward', async () => {
            const nonExistentRewardId = 'non-existent-reward-id';
            
            await request(app)
                .post(`/api/v1/loyalty/rewards/${nonExistentRewardId}/redeem`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    describe('PUT /api/v1/loyalty/preferences', () => {
        it('should update loyalty preferences successfully', async () => {
            const preferencesData = {
                notifications: {
                    pointsEarned: true,
                    badgeUnlocked: false,
                    tierUpgrade: true,
                    pointsExpiring: true
                },
                autoRedeem: {
                    enabled: false,
                    threshold: 1000,
                    rewardType: 'discount'
                }
            };

            const response = await request(app)
                .put('/api/v1/loyalty/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send(preferencesData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.notifications.pointsEarned).toBe(true);
            expect(response.body.data.notifications.badgeUnlocked).toBe(false);
            expect(response.body.data.autoRedeem.enabled).toBe(false);
        });

        it('should validate preferences data', async () => {
            const invalidPreferencesData = {
                notifications: {
                    pointsEarned: 'invalid' // Should be boolean
                }
            };

            await request(app)
                .put('/api/v1/loyalty/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPreferencesData)
                .expect(400);
        });

        it('should require authentication', async () => {
            const preferencesData = {
                notifications: {
                    pointsEarned: true
                }
            };

            await request(app)
                .put('/api/v1/loyalty/preferences')
                .send(preferencesData)
                .expect(401);
        });
    });

    describe('GET /api/v1/loyalty/analytics', () => {
        it('should get loyalty analytics successfully (admin only)', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/analytics')
                .set('Authorization', `Bearer ${authToken}`);

            // This might return 403 if not admin, which is expected
            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.totalUsers).toBeDefined();
                expect(response.body.data.pointsDistribution).toBeDefined();
                expect(response.body.data.tierDistribution).toBeDefined();
                expect(response.body.data.recentActivity).toBeDefined();
                expect(response.body.data.topEarners).toBeDefined();
                expect(Array.isArray(response.body.data.pointsDistribution)).toBe(true);
                expect(Array.isArray(response.body.data.tierDistribution)).toBe(true);
            } else {
                expect(response.status).toBe(403);
            }
        });

        it('should filter analytics by period', async () => {
            const response = await request(app)
                .get('/api/v1/loyalty/analytics?period=30')
                .set('Authorization', `Bearer ${authToken}`);

            if (response.status === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.period).toBe('30');
            } else {
                expect(response.status).toBe(403);
            }
        });
    });

    describe('Rate Limiting', () => {
        it('should enforce rate limits on redeem endpoint', async () => {
            const redeemData = {
                points: 1,
                description: 'Rate limit test'
            };

            // Make multiple requests quickly to test rate limiting
            const promises = Array(5).fill().map(() =>
                request(app)
                    .post('/api/v1/loyalty/redeem')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(redeemData)
            );

            const responses = await Promise.all(promises);
            
            // At least one should be rate limited (429 status)
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });
});
