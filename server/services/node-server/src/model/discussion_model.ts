import mongoose, { Schema, Types } from "mongoose";
import { Discussion } from "../types/discussion";

const discussionSchema = new Schema<Discussion>({
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        omit: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User"
    },
    isReadOnly: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const DiscussionModel = mongoose.model<Discussion>('Discussion', discussionSchema)