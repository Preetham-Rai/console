import mongoose, { Schema, Types } from "mongoose";
import { comment } from "../../types/discussions/comment";

const commentSchema = new Schema<comment>({
    discussionId: {
        type: Types.ObjectId,
        ref: 'Discussion',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mentions: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

commentSchema.index({ discussionId: 1, createdAt: -1 })

export const CommentModel = mongoose.model('Comment', commentSchema)