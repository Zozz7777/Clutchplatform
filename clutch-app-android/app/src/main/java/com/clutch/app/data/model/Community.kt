package com.clutch.app.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class CommunityTip(
    val id: String,
    val userId: String,
    val userName: String? = null,
    val userProfilePicture: String? = null,
    val type: String, // "tip" or "review"
    val title: String,
    val content: String,
    val category: String,
    val images: List<CommunityImage> = emptyList(),
    val votes: CommunityVotes,
    val rating: Int? = null,
    val partnerId: String? = null,
    val partnerName: String? = null,
    val serviceId: String? = null,
    val tags: List<String> = emptyList(),
    val isApproved: Boolean = true,
    val isFeatured: Boolean = false,
    val viewCount: Int = 0,
    val shareCount: Int = 0,
    val comments: List<CommunityComment> = emptyList(),
    val language: String = "en",
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class CommunityImage(
    val url: String,
    val alt: String = ""
) : Parcelable

@Parcelize
data class CommunityVotes(
    val up: Int = 0,
    val down: Int = 0,
    val userVote: String? = null // "up", "down", or null
) : Parcelable

@Parcelize
data class CommunityComment(
    val id: String,
    val userId: String,
    val userName: String? = null,
    val userProfilePicture: String? = null,
    val content: String,
    val createdAt: String,
    val isEdited: Boolean = false,
    val editedAt: String? = null
) : Parcelable

@Parcelize
data class CommunityLeaderboard(
    val topContributors: List<LeaderboardUser>,
    val topTipCreators: List<LeaderboardUser>,
    val topReviewers: List<LeaderboardUser>,
    val period: String
) : Parcelable

@Parcelize
data class LeaderboardUser(
    val userId: String,
    val name: String,
    val profilePicture: String? = null,
    val points: Int? = null,
    val tipCount: Int? = null,
    val reviewCount: Int? = null,
    val totalVotes: Int? = null,
    val avgRating: Double? = null
) : Parcelable

@Parcelize
data class CommunityStats(
    val totalTips: Int,
    val totalReviews: Int,
    val totalVotes: Int,
    val categoryStats: List<CategoryStat>,
    val recentActivity: List<CommunityTip>
) : Parcelable

@Parcelize
data class CategoryStat(
    val category: String,
    val count: Int
) : Parcelable
