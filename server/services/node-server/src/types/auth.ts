import { Document, Types } from "mongoose";

export interface TokenSystem extends Document {
    userID: Types.ObjectId,
    token: string,
    deviceID: string,
    expiresAt: Date,
    createdAt: Date,
    updatedAt: Date
}