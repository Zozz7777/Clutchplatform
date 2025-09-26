package com.clutch.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class LoyaltyAccount(
    val userId: String,
    val pointsBalance: Int,
    val totalEarned: Int,
    val totalRedeemed: Int,
    val tier: String, // bronze, silver, gold, platinum
    val tierProgress: Float,
    val nextTier: NextTier?,
    val badges: List<LoyaltyBadge>,
    val recentHistory: List<LoyaltyHistoryEntry>,
    val expiringPoints: List<LoyaltyHistoryEntry>,
    val stats: LoyaltyStats,
    val preferences: LoyaltyPreferences
) : Parcelable

@Parcelize
data class NextTier(
    val tier: String,
    val required: Int
) : Parcelable

@Parcelize
data class LoyaltyBadge(
    val name: String,
    val description: String,
    val icon: String,
    val category: String, // achievement, milestone, special, seasonal
    val unlockedAt: String
) : Parcelable

@Parcelize
data class LoyaltyHistoryEntry(
    val actionType: String, // earn, redeem, bonus, penalty, expire
    val points: Int,
    val description: String,
    val referenceId: String? = null,
    val referenceType: String? = null,
    val date: String,
    val expiresAt: String? = null
) : Parcelable

@Parcelize
data class LoyaltyStats(
    val totalOrders: Int,
    val totalReviews: Int,
    val totalTips: Int,
    val totalReferrals: Int,
    val streakDays: Int,
    val lastActivityDate: String
) : Parcelable

@Parcelize
data class LoyaltyPreferences(
    val notifications: LoyaltyNotificationPreferences,
    val autoRedeem: AutoRedeemPreferences
) : Parcelable

@Parcelize
data class LoyaltyNotificationPreferences(
    val pointsEarned: Boolean = true,
    val badgeUnlocked: Boolean = true,
    val tierUpgrade: Boolean = true,
    val pointsExpiring: Boolean = true
) : Parcelable

@Parcelize
data class AutoRedeemPreferences(
    val enabled: Boolean = false,
    val threshold: Int = 1000,
    val rewardType: String = "discount" // discount, cashback, gift
) : Parcelable

@Parcelize
data class LoyaltyReward(
    val id: String,
    val name: String,
    val description: String,
    val pointsRequired: Int,
    val category: String,
    val tier: String,
    val type: String, // discount, shipping, cashback, service
    val value: Int,
    val maxUses: Int,
    val expiresIn: Int // days
) : Parcelable

@Parcelize
data class LoyaltyLeaderboard(
    val leaderboard: List<LoyaltyLeaderboardUser>,
    val tierDistribution: List<TierDistribution>,
    val period: String
) : Parcelable

@Parcelize
data class LoyaltyLeaderboardUser(
    val userId: String,
    val name: String,
    val profilePicture: String? = null,
    val pointsBalance: Int,
    val totalEarned: Int,
    val tier: String,
    val totalOrders: Int,
    val totalReviews: Int,
    val totalTips: Int
) : Parcelable

@Parcelize
data class TierDistribution(
    val tier: String,
    val count: Int
) : Parcelable
