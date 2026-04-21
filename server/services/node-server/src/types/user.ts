export interface User {
    name: string
    email: string
    username?: string
    password: string
    isEmailVerified: boolean
    lastLoginAt?: Date
    role: 'user' | 'admin'
    permissions?: string[]
    avatarUrl?: string
    bio?: string
    location?: string
    preferences?: {
        theme: 'light' | 'dark'
        notifications: boolean
    }
    isDeleted: boolean
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date
}