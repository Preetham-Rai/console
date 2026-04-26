import mongoose, { Schema, Types } from "mongoose";
import { Discussion } from "../../types/discussions/discussion";

const discussionSchema = new Schema<Discussion>({
    subject: {
        type: String,
        required: true,
        maxLength: 150
    },
    content: {
        body: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'markdown', 'html'],
            default: 'text'
        }
    },
    attachments: [
        {
            url: { type: String, required: true },
            type: {
                type: String,
                enum: ['image', 'video', 'pdf', 'doc', 'other'],
                required: true
            },
            name: String,
            size: Number
        }
    ],
    tags: [
        {
            type: Types.ObjectId,
            ref: 'Tag'
        }
    ],
    status: {
        type: String,
        enum: ['open', 'closed', 'archived'],
        default: 'open'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'restricted'],
        default: 'public'
    },
    allowedUser: [{
        type: Types.ObjectId,
        ref: "User"
    }],
    mentions: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Types.ObjectId,
        ref: "User"
    },
    isReadOnly: {
        type: Boolean,
        default: false
    },
    stats: {
        views: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 }
    },
    lastActivityAt: {
        type: Date
    }
}, {
    timestamps: true
})

discussionSchema.index({ createdBy: 1 })
discussionSchema.index({ tags: 1 })
discussionSchema.index({ status: 1 });
discussionSchema.index({ lastActivityAt: -1 });

export const DiscussionModel = mongoose.model<Discussion>('Discussion', discussionSchema)