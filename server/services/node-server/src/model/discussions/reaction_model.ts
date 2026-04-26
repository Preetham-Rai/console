import mongoose, { Schema, Types } from "mongoose";

const reactionSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    targetType: {
        type: String,
        enum: ['discussion', 'comment'],
        required: true
    },
    targetId: {
        type: Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'upvote', 'downvote'],
        default: 'like'
    }
}, {
    timestamps: true
});

reactionSchema.index(
    { userId: 1, targetId: 1, targetType: 1 },
    { unique: true }
);

export const ReactionModel = mongoose.model("Reaction", reactionSchema);