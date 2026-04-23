import { Schema, model, CallbackWithoutResultAndOptionalError } from 'mongoose'
import bcrypt from 'bcrypt'
import { User } from '../types/user'

const userSchema = new Schema<User>({
    username: {
        type: String,
        required: true,
        minLength: 3,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
        index: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    role: {
        type: String,
        default: 'user',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    avatarUrl: {
        type: String
    },
    bio: {
        type: String
    },
    location: {
        type: String
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        index: true
    },
    permissions: {
        type: [String],
        default: ['read']
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
})

export const UserModel = model<User>('User', userSchema)
