import { Document, Types } from "mongoose";

export interface IDiscussion extends Document {
    title: string;
    content: string;
    author: Types.ObjectId;
    tags: string[];
    upvotes: number;
    downvotes: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date
}