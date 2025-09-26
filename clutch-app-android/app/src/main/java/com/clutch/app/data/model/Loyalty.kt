package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class LoyaltyPoints(
    @SerializedName("userId") val userId: String,
    @SerializedName("pointsBalance") val pointsBalance: Int,
    @SerializedName("totalEarned") val totalEarned: Int,
    @SerializedName("totalRedeemed") val totalRedeemed: Int,
    @SerializedName("history") val history: List<LoyaltyHistoryItem>,
    @SerializedName("badges") val badges: List<Badge>
)

data class LoyaltyHistoryItem(
    @SerializedName("_id") val id: String,
    @SerializedName("actionType") val actionType: String, // "earn", "redeem"
    @SerializedName("points") val points: Int,
    @SerializedName("description") val description: String,
    @SerializedName("referenceId") val referenceId: String?,
    @SerializedName("date") val date: String
)

data class Badge(
    @SerializedName("_id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String,
    @SerializedName("icon") val icon: String,
    @SerializedName("unlockedAt") val unlockedAt: String,
    @SerializedName("isUnlocked") val isUnlocked: Boolean
)

data class EarnPointsRequest(
    @SerializedName("actionType") val actionType: String,
    @SerializedName("points") val points: Int,
    @SerializedName("description") val description: String,
    @SerializedName("referenceId") val referenceId: String?
)

data class RedeemPointsRequest(
    @SerializedName("rewardId") val rewardId: String,
    @SerializedName("points") val points: Int
)
