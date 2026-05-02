import mongoose, { Schema, Types } from "mongoose";
import { TokenSystem } from "../types/auth";

const tokenSchema = new Schema<TokenSystem>({
    userID: { type: Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    deviceID: { type: String },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

export const TokenModel = mongoose.model<TokenSystem>("Token", tokenSchema);