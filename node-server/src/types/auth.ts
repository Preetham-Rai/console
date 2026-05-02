import { Document, Types } from "mongoose";

export interface TokenSystem extends Document {
    userID: Types.ObjectId,
    token: string,
    deviceID: string,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date
}

export interface AuthUser {
    id: string | undefined
    email: string | undefined
    role: string | undefined
    permissions: string[] | undefined
    isActive: boolean | undefined
    isEmailVerified: boolean | undefined
    username: string | undefined
}