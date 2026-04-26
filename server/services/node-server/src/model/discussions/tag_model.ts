import mongoose, { Schema, Types } from "mongoose";

const tagSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        unique: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

tagSchema.index({ name: 1 });

export const TagModel = mongoose.model("Tag", tagSchema);