import Foundation

struct CommunityTip: Codable, Identifiable {
    let id: String
    let userId: String
    let userName: String?
    let userProfilePicture: String?
    let type: String // "tip" or "review"
    let title: String
    let content: String
    let category: String
    let images: [CommunityImage]
    let votes: CommunityVotes
    let rating: Int?
    let partnerId: String?
    let partnerName: String?
    let serviceId: String?
    let tags: [String]
    let isApproved: Bool
    let isFeatured: Bool
    let viewCount: Int
    let shareCount: Int
    let comments: [CommunityComment]
    let language: String
    let createdAt: String
    let updatedAt: String
}

struct CommunityImage: Codable {
    let url: String
    let alt: String
}

struct CommunityVotes: Codable {
    let up: Int
    let down: Int
    let userVote: String? // "up", "down", or null
}

struct CommunityComment: Codable, Identifiable {
    let id: String
    let userId: String
    let userName: String?
    let userProfilePicture: String?
    let content: String
    let createdAt: String
    let isEdited: Bool
    let editedAt: String?
}

struct CommunityLeaderboard: Codable {
    let topContributors: [LeaderboardUser]
    let topTipCreators: [LeaderboardUser]
    let topReviewers: [LeaderboardUser]
    let period: String
}

struct LeaderboardUser: Codable, Identifiable {
    let id = UUID()
    let userId: String
    let name: String
    let profilePicture: String?
    let points: Int?
    let tipCount: Int?
    let reviewCount: Int?
    let totalVotes: Int?
    let avgRating: Double?
}

struct CommunityStats: Codable {
    let totalTips: Int
    let totalReviews: Int
    let totalVotes: Int
    let categoryStats: [CategoryStat]
    let recentActivity: [CommunityTip]
}

struct CategoryStat: Codable {
    let category: String
    let count: Int
}

// MARK: - Request/Response Models
struct CreateCommunityTipRequest: Codable {
    let type: String
    let title: String
    let content: String
    let category: String
    let images: [CommunityImage]
    let rating: Int?
    let partnerId: String?
    let serviceId: String?
    let tags: [String]
    let language: String
}

struct VoteRequest: Codable {
    let voteType: String // "up" or "down"
}

struct VoteResponse: Codable {
    let success: Bool
    let data: VoteData
    let message: String
}

struct VoteData: Codable {
    let votes: CommunityVotes
    let totalVotes: Int
}

struct CommentRequest: Codable {
    let content: String
}

struct CommunityTipsResponse: Codable {
    let success: Bool
    let data: CommunityTipsData
}

struct CommunityTipsData: Codable {
    let tips: [CommunityTip]
    let pagination: Pagination
}

struct Pagination: Codable {
    let current: Int
    let pages: Int
    let total: Int
}
