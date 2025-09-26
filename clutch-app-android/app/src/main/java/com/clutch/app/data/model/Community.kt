package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class CommunityTip(
    @SerializedName("_id") val id: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("type") val type: String = "tip",
    @SerializedName("content") val content: String,
    @SerializedName("images") val images: List<String> = emptyList(),
    @SerializedName("votes") val votes: VoteCount,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String,
    @SerializedName("user") val user: CommunityUser? = null
)

data class Review(
    @SerializedName("_id") val id: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("partnerId") val partnerId: String,
    @SerializedName("serviceId") val serviceId: String?,
    @SerializedName("type") val type: String = "review",
    @SerializedName("content") val content: String,
    @SerializedName("rating") val rating: Int, // 1-5
    @SerializedName("images") val images: List<String> = emptyList(),
    @SerializedName("votes") val votes: VoteCount,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String,
    @SerializedName("user") val user: CommunityUser? = null
)

data class Vote(
    @SerializedName("itemId") val itemId: String,
    @SerializedName("itemType") val itemType: String, // "tip" or "review"
    @SerializedName("voteType") val voteType: String // "up" or "down"
)

data class VoteCount(
    @SerializedName("up") val up: Int = 0,
    @SerializedName("down") val down: Int = 0
)

data class LeaderboardEntry(
    @SerializedName("userId") val userId: String,
    @SerializedName("user") val user: CommunityUser,
    @SerializedName("totalPoints") val totalPoints: Int,
    @SerializedName("tipsCount") val tipsCount: Int,
    @SerializedName("reviewsCount") val reviewsCount: Int,
    @SerializedName("rank") val rank: Int
)

data class CommunityUser(
    @SerializedName("_id") val id: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("profileImage") val profileImage: String?
)
