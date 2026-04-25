export interface UserRegistration {
    name: string
    email: string
    username?: string
    password: string
    role: string
    bio?: string
    location?: string
    preferences?: {
        theme: 'light' | 'dark'
        notifications: boolean
    }
    isActive: boolean
}