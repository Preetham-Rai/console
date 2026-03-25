import { Schema, model } from "mongoose";
import { IDiscussion } from "./discussion.interface";

const discussionSchema = new Schema<IDiscussion>({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: {
        type: [String],
        validate: {
            validator: function (tags: String[]) {
                return tags.length <= 4
            },
            message: 'Maximum 4 Tags are allowed'
        }
    },
    upvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    downvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
}, {
    timestamps: true
})

export const DiscussionModel = model<IDiscussion>('Discussion', discussionSchema)
