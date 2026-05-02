export interface User {
    name: string
    email: string
    username?: string
    password: string
    isEmailVerified?: boolean       // defaults to false
    lastLoginAt?: Date
    role: 'user' | 'admin' | 'moderator'         // defaults to 'user'
    permissions?: string[]
    avatarUrl?: string
    bio?: string
    location?: string
    lastSeenAt?: Date
    isOnline?: boolean
    preferences?: {
        theme?: 'light' | 'dark'    // defaults to 'light'
        notifications?: boolean
        allowMessagesFrom?: 'everyone' | 'followers' | 'none'
    }
    isDeleted?: boolean             // defaults to false
    isActive?: boolean              // defaults to true
    deletedAt?: Date
    createdAt?: Date                // auto-set by mongoose timestamps
    updatedAt?: Date                // auto-set by mongoose timestamps
    followersCount?: number
    followingCount?: number
    blockedUsers?: string[]
}