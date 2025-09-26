import Foundation

struct LoyaltyAccount: Codable {
    let userId: String
    let pointsBalance: Int
    let totalEarned: Int
    let totalRedeemed: Int
    let tier: String // bronze, silver, gold, platinum
    let tierProgress: Float
    let nextTier: NextTier?
    let badges: [LoyaltyBadge]
    let recentHistory: [LoyaltyHistoryEntry]
    let expiringPoints: [LoyaltyHistoryEntry]
    let stats: LoyaltyStats
    let preferences: LoyaltyPreferences
}

struct NextTier: Codable {
    let tier: String
    let required: Int
}

struct LoyaltyBadge: Codable, Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let icon: String
    let category: String // achievement, milestone, special, seasonal
    let unlockedAt: String
}

struct LoyaltyHistoryEntry: Codable, Identifiable {
    let id = UUID()
    let actionType: String // earn, redeem, bonus, penalty, expire
    let points: Int
    let description: String
    let referenceId: String?
    let referenceType: String?
    let date: String
    let expiresAt: String?
}

struct LoyaltyStats: Codable {
    let totalOrders: Int
    let totalReviews: Int
    let totalTips: Int
    let totalReferrals: Int
    let streakDays: Int
    let lastActivityDate: String
}

struct LoyaltyPreferences: Codable {
    let notifications: LoyaltyNotificationPreferences
    let autoRedeem: AutoRedeemPreferences
}

struct LoyaltyNotificationPreferences: Codable {
    let pointsEarned: Bool
    let badgeUnlocked: Bool
    let tierUpgrade: Bool
    let pointsExpiring: Bool
}

struct AutoRedeemPreferences: Codable {
    let enabled: Bool
    let threshold: Int
    let rewardType: String // discount, cashback, gift
}

struct LoyaltyReward: Codable, Identifiable {
    let id: String
    let name: String
    let description: String
    let pointsRequired: Int
    let category: String
    let tier: String
    let type: String // discount, shipping, cashback, service
    let value: Int
    let maxUses: Int
    let expiresIn: Int // days
}

struct LoyaltyLeaderboard: Codable {
    let leaderboard: [LoyaltyLeaderboardUser]
    let tierDistribution: [TierDistribution]
    let period: String
}

struct LoyaltyLeaderboardUser: Codable, Identifiable {
    let id = UUID()
    let userId: String
    let name: String
    let profilePicture: String?
    let pointsBalance: Int
    let totalEarned: Int
    let tier: String
    let totalOrders: Int
    let totalReviews: Int
    let totalTips: Int
}

struct TierDistribution: Codable {
    let tier: String
    let count: Int
}

// MARK: - Request/Response Models
struct RedeemPointsRequest: Codable {
    let points: Int
    let description: String
    let referenceType: String?
}

struct RedeemPointsResponse: Codable {
    let success: Bool
    let data: RedeemPointsData
    let message: String
}

struct RedeemPointsData: Codable {
    let pointsBalance: Int
    let redeemedPoints: Int
}

struct LoyaltyBadgesResponse: Codable {
    let success: Bool
    let data: LoyaltyBadgesData
}

struct LoyaltyBadgesData: Codable {
    let badges: [LoyaltyBadge]
    let badgesByCategory: [String: [LoyaltyBadge]]
    let totalBadges: Int
}

struct LoyaltyRewardsResponse: Codable {
    let success: Bool
    let data: LoyaltyRewardsData
}

struct LoyaltyRewardsData: Codable {
    let rewards: [LoyaltyReward]
    let categories: [String]
    let totalRewards: Int
}

struct RedeemRewardResponse: Codable {
    let success: Bool
    let data: RedeemRewardData
    let message: String
}

struct RedeemRewardData: Codable {
    let reward: LoyaltyReward
    let pointsBalance: Int
    let redeemedPoints: Int
}
