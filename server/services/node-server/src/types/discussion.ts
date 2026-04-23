import { Types, Document } from "mongoose";

export interface Discussion extends Document {
    subject: string;
    description: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: Types.ObjectId;
    isReadOnly?: boolean;
    views?: number;
    commentsCount?: number;
    status?: 'open' | 'closed' | 'archived';
    isPinned?: boolean;
    lastActivityDate?: Date
}