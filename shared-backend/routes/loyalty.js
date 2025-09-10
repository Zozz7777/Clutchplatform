const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const { ObjectId } = require('mongodb');

// ==================== LOYALTY POINTS ====================

// Get user's points balance
router.get('/points-balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const loyaltyCollection = await getCollection('loyalty_points');
        const loyalty = await loyaltyCollection.findOne({ userId });

        if (!loyalty) {
            // Create new loyalty account
            const newLoyalty = {
                userId,
                pointsBalance: 0,
                totalPointsEarned: 0,
                totalPointsRedeemed: 0,
                tier: 'bronze',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await loyaltyCollection.insertOne(newLoyalty);
            newLoyalty._id = result.insertedId;
            
            return res.json({
                success: true,
                data: newLoyalty
            });
        }

        // Calculate tier based on total points earned
        const tier = calculateTier(loyalty.totalPointsEarned);
        if (tier !== loyalty.tier) {
            await loyaltyCollection.updateOne(
                { userId },
                { $set: { tier, updatedAt: new Date() } }
            );
            loyalty.tier = tier;
        }

        res.json({
            success: true,
            data: loyalty
        });
    } catch (error) {
        logger.error('Get points balance error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_POINTS_BALANCE_ERROR',
            message: 'Failed to retrieve points balance'
        });
    }
});

// Get points history
router.get('/points-history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filters = { userId };
        if (type) {
            filters.type = type; // 'earned', 'redeemed', 'expired'
        }

        const historyCollection = await getCollection('loyalty_points_history');
        const [history, total] = await Promise.all([
            historyCollection.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            historyCollection.countDocuments(filters)
        ]);

        res.json({
            success: true,
            data: history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get points history error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_POINTS_HISTORY_ERROR',
            message: 'Failed to retrieve points history'
        });
    }
});

// Earn points
router.post('/points/earn', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, reason, source, sourceId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_AMOUNT',
                message: 'Points amount must be greater than 0'
            });
        }

        const loyaltyCollection = await getCollection('loyalty_points');
        const historyCollection = await getCollection('loyalty_points_history');

        // Get or create loyalty account
        let loyalty = await loyaltyCollection.findOne({ userId });
        if (!loyalty) {
            loyalty = {
                userId,
                pointsBalance: 0,
                totalPointsEarned: 0,
                totalPointsRedeemed: 0,
                tier: 'bronze',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await loyaltyCollection.insertOne(loyalty);
            loyalty._id = result.insertedId;
        }

        // Update points balance
        const newBalance = loyalty.pointsBalance + amount;
        const newTotalEarned = loyalty.totalPointsEarned + amount;
        const newTier = calculateTier(newTotalEarned);

        await loyaltyCollection.updateOne(
            { userId },
            {
                $set: {
                    pointsBalance: newBalance,
                    totalPointsEarned: newTotalEarned,
                    tier: newTier,
                    updatedAt: new Date()
                }
            }
        );

        // Record transaction
        const transaction = {
            userId,
            type: 'earned',
            amount,
            reason: reason || 'Points earned',
            source: source || 'general',
            sourceId: sourceId || null,
            balanceAfter: newBalance,
            createdAt: new Date()
        };

        await historyCollection.insertOne(transaction);

        res.json({
            success: true,
            message: 'Points earned successfully',
            data: {
                pointsEarned: amount,
                newBalance,
                newTier,
                transaction
            }
        });
    } catch (error) {
        logger.error('Earn points error:', error);
        res.status(500).json({
            success: false,
            error: 'EARN_POINTS_ERROR',
            message: 'Failed to earn points'
        });
    }
});

// Redeem points
router.post('/points/redeem', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, reason, rewardId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_AMOUNT',
                message: 'Points amount must be greater than 0'
            });
        }

        const loyaltyCollection = await getCollection('loyalty_points');
        const historyCollection = await getCollection('loyalty_points_history');

        const loyalty = await loyaltyCollection.findOne({ userId });
        if (!loyalty) {
            return res.status(404).json({
                success: false,
                error: 'LOYALTY_ACCOUNT_NOT_FOUND',
                message: 'Loyalty account not found'
            });
        }

        if (loyalty.pointsBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'INSUFFICIENT_POINTS',
                message: 'Insufficient points balance'
            });
        }

        // Update points balance
        const newBalance = loyalty.pointsBalance - amount;
        const newTotalRedeemed = loyalty.totalPointsRedeemed + amount;

        await loyaltyCollection.updateOne(
            { userId },
            {
                $set: {
                    pointsBalance: newBalance,
                    totalPointsRedeemed: newTotalRedeemed,
                    updatedAt: new Date()
                }
            }
        );

        // Record transaction
        const transaction = {
            userId,
            type: 'redeemed',
            amount,
            reason: reason || 'Points redeemed',
            rewardId: rewardId || null,
            balanceAfter: newBalance,
            createdAt: new Date()
        };

        await historyCollection.insertOne(transaction);

        res.json({
            success: true,
            message: 'Points redeemed successfully',
            data: {
                pointsRedeemed: amount,
                newBalance,
                transaction
            }
        });
    } catch (error) {
        logger.error('Redeem points error:', error);
        res.status(500).json({
            success: false,
            error: 'REDEEM_POINTS_ERROR',
            message: 'Failed to redeem points'
        });
    }
});

// ==================== REWARDS CATALOG ====================

// Get rewards catalog
router.get('/rewards-catalog', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, tier, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get user's tier
        const loyaltyCollection = await getCollection('loyalty_points');
        const loyalty = await loyaltyCollection.findOne({ userId });
        const userTier = loyalty?.tier || 'bronze';

        const filters = { isActive: true };
        if (category) filters.category = category;
        if (tier) filters.tier = tier;

        const rewardsCollection = await getCollection('loyalty_rewards');
        const [rewards, total] = await Promise.all([
            rewardsCollection.find(filters)
                .sort({ pointsRequired: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            rewardsCollection.countDocuments(filters)
        ]);

        // Filter rewards based on user tier
        const availableRewards = rewards.filter(reward => {
            const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
            return tierOrder[reward.tier] <= tierOrder[userTier];
        });

        res.json({
            success: true,
            data: availableRewards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get rewards catalog error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REWARDS_CATALOG_ERROR',
            message: 'Failed to retrieve rewards catalog'
        });
    }
});

// Get specific reward
router.get('/rewards/:rewardId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rewardId } = req.params;

        const rewardsCollection = await getCollection('loyalty_rewards');
        const reward = await rewardsCollection.findOne({ 
            _id: new ObjectId(rewardId),
            isActive: true 
        });

        if (!reward) {
            return res.status(404).json({
                success: false,
                error: 'REWARD_NOT_FOUND',
                message: 'Reward not found'
            });
        }

        // Check if user can redeem this reward
        const loyaltyCollection = await getCollection('loyalty_points');
        const loyalty = await loyaltyCollection.findOne({ userId });
        const userTier = loyalty?.tier || 'bronze';
        const userPoints = loyalty?.pointsBalance || 0;

        const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
        const canRedeem = tierOrder[reward.tier] <= tierOrder[userTier] && userPoints >= reward.pointsRequired;

        const rewardWithAvailability = {
            ...reward,
            canRedeem,
            userPoints,
            userTier
        };

        res.json({
            success: true,
            data: rewardWithAvailability
        });
    } catch (error) {
        logger.error('Get reward error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REWARD_ERROR',
            message: 'Failed to retrieve reward'
        });
    }
});

// Redeem reward
router.post('/rewards/redeem/:rewardId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { rewardId } = req.params;

        const rewardsCollection = await getCollection('loyalty_rewards');
        const reward = await rewardsCollection.findOne({ 
            _id: new ObjectId(rewardId),
            isActive: true 
        });

        if (!reward) {
            return res.status(404).json({
                success: false,
                error: 'REWARD_NOT_FOUND',
                message: 'Reward not found'
            });
        }

        const loyaltyCollection = await getCollection('loyalty_points');
        const loyalty = await loyaltyCollection.findOne({ userId });

        if (!loyalty) {
            return res.status(404).json({
                success: false,
                error: 'LOYALTY_ACCOUNT_NOT_FOUND',
                message: 'Loyalty account not found'
            });
        }

        // Check tier requirement
        const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
        if (tierOrder[reward.tier] > tierOrder[loyalty.tier]) {
            return res.status(400).json({
                success: false,
                error: 'INSUFFICIENT_TIER',
                message: 'Your tier is not high enough to redeem this reward'
            });
        }

        // Check points requirement
        if (loyalty.pointsBalance < reward.pointsRequired) {
            return res.status(400).json({
                success: false,
                error: 'INSUFFICIENT_POINTS',
                message: 'Insufficient points to redeem this reward'
            });
        }

        // Create redemption
        const redemptionsCollection = await getCollection('loyalty_redemptions');
        const redemption = {
            userId,
            rewardId: reward._id,
            rewardName: reward.name,
            pointsSpent: reward.pointsRequired,
            status: 'pending',
            redemptionCode: generateRedemptionCode(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await redemptionsCollection.insertOne(redemption);

        // Deduct points
        const newBalance = loyalty.pointsBalance - reward.pointsRequired;
        const newTotalRedeemed = loyalty.totalPointsRedeemed + reward.pointsRequired;

        await loyaltyCollection.updateOne(
            { userId },
            {
                $set: {
                    pointsBalance: newBalance,
                    totalPointsRedeemed: newTotalRedeemed,
                    updatedAt: new Date()
                }
            }
        );

        // Record points transaction
        const historyCollection = await getCollection('loyalty_points_history');
        await historyCollection.insertOne({
            userId,
            type: 'redeemed',
            amount: reward.pointsRequired,
            reason: `Redeemed: ${reward.name}`,
            rewardId: reward._id,
            balanceAfter: newBalance,
            createdAt: new Date()
        });

        res.json({
            success: true,
            message: 'Reward redeemed successfully',
            data: {
                redemption: {
                    ...redemption,
                    _id: result.insertedId
                },
                newBalance
            }
        });
    } catch (error) {
        logger.error('Redeem reward error:', error);
        res.status(500).json({
            success: false,
            error: 'REDEEM_REWARD_ERROR',
            message: 'Failed to redeem reward'
        });
    }
});

// ==================== REFERRAL SYSTEM ====================

// Get user's referral code
router.get('/referral-code', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const referralsCollection = await getCollection('referrals');
        let referral = await referralsCollection.findOne({ userId });

        if (!referral) {
            // Generate new referral code
            const referralCode = generateReferralCode();
            referral = {
                userId,
                referralCode,
                totalReferrals: 0,
                totalEarnings: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await referralsCollection.insertOne(referral);
            referral._id = result.insertedId;
        }

        res.json({
            success: true,
            data: {
                referralCode: referral.referralCode,
                totalReferrals: referral.totalReferrals,
                totalEarnings: referral.totalEarnings,
                shareUrl: `https://clutch.com/refer/${referral.referralCode}`
            }
        });
    } catch (error) {
        logger.error('Get referral code error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REFERRAL_CODE_ERROR',
            message: 'Failed to get referral code'
        });
    }
});

// Use referral code
router.post('/referral/use/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'User ID and email are required'
            });
        }

        const referralsCollection = await getCollection('referrals');
        const referral = await referralsCollection.findOne({ 
            referralCode: code.toUpperCase(),
            isActive: true
        });

        if (!referral) {
            return res.status(404).json({
                success: false,
                error: 'INVALID_REFERRAL_CODE',
                message: 'Invalid referral code'
            });
        }

        // Check if user is referring themselves
        if (referral.userId === userId) {
            return res.status(400).json({
                success: false,
                error: 'SELF_REFERRAL',
                message: 'Cannot use your own referral code'
            });
        }

        // Check if user has already been referred
        const existingReferral = await referralsCollection.findOne({
            referredUserId: userId
        });

        if (existingReferral) {
            return res.status(400).json({
                success: false,
                error: 'ALREADY_REFERRED',
                message: 'User has already been referred'
            });
        }

        // Create referral record
        const referralRecord = {
            referrerId: referral.userId,
            referredUserId: userId,
            referredEmail: email,
            referralCode: code.toUpperCase(),
            status: 'pending',
            pointsEarned: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await referralsCollection.insertOne(referralRecord);

        // Update referrer stats
        await referralsCollection.updateOne(
            { userId: referral.userId },
            {
                $inc: { totalReferrals: 1 },
                $set: { updatedAt: new Date() }
            }
        );

        res.json({
            success: true,
            message: 'Referral code applied successfully',
            data: {
                referrerId: referral.userId,
                referralCode: code.toUpperCase()
            }
        });
    } catch (error) {
        logger.error('Use referral code error:', error);
        res.status(500).json({
            success: false,
            error: 'USE_REFERRAL_CODE_ERROR',
            message: 'Failed to use referral code'
        });
    }
});

// Get referral history
router.get('/referral/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const referralsCollection = await getCollection('referrals');
        const [referrals, total] = await Promise.all([
            referralsCollection.find({ referrerId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray(),
            referralsCollection.countDocuments({ referrerId: userId })
        ]);

        res.json({
            success: true,
            data: referrals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get referral history error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REFERRAL_HISTORY_ERROR',
            message: 'Failed to retrieve referral history'
        });
    }
});

// Get referral earnings
router.get('/referral/earnings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const referralsCollection = await getCollection('referrals');
        const referral = await referralsCollection.findOne({ userId });

        if (!referral) {
            return res.json({
                success: true,
                data: {
                    totalReferrals: 0,
                    totalEarnings: 0,
                    pendingReferrals: 0,
                    completedReferrals: 0
                }
            });
        }

        // Get detailed stats
        const [pendingReferrals, completedReferrals] = await Promise.all([
            referralsCollection.countDocuments({ 
                referrerId: userId, 
                status: 'pending' 
            }),
            referralsCollection.countDocuments({ 
                referrerId: userId, 
                status: 'completed' 
            })
        ]);

        const earnings = {
            totalReferrals: referral.totalReferrals,
            totalEarnings: referral.totalEarnings,
            pendingReferrals,
            completedReferrals
        };

        res.json({
            success: true,
            data: earnings
        });
    } catch (error) {
        logger.error('Get referral earnings error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_REFERRAL_EARNINGS_ERROR',
            message: 'Failed to retrieve referral earnings'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

function calculateTier(totalPointsEarned) {
    if (totalPointsEarned >= 10000) return 'platinum';
    if (totalPointsEarned >= 5000) return 'gold';
    if (totalPointsEarned >= 1000) return 'silver';
    return 'bronze';
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRedemptionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

module.exports = router;
