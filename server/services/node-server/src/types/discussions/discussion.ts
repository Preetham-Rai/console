import { Types, Document } from "mongoose";

export interface Discussion extends Document {
    subject: string;
    content?: {
        type: 'text' | 'markdown' | 'html'
        body: string
    },
    attachments?: {
        url: string;
        type: 'image' | 'video' | 'pdf' | 'doc' | 'other';
        name?: string;
        size?: number
    }[],
    tags?: Types.ObjectId[];
    mentions?: Types.ObjectId[]
    visibility?: 'private' | 'public' | 'restricted'
    allowedUser?: Types.ObjectId[]
    allowedRoles?: string[]
    createdAt: Date;
    updatedAt: Date;
    createdBy: Types.ObjectId;
    isReadOnly?: boolean;
    status?: 'open' | 'closed' | 'archived';
    closedAt?: Date;
    isPinned?: boolean;
    isDeleted?: boolean
    lastActivityAt?: Date
    lastCommentId?: Types.ObjectId;
    stats?: {
        views?: number;
        commentsCount?: number;
        reactionCount?: number
    }
}