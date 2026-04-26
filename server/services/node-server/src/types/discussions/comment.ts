import { Types } from "mongoose";


export interface comment {
    discussionId: Types.ObjectId;
    content: string;
    mentions?: Types.ObjectId[];
    createdBy: Types.ObjectId;
    isEdited?: boolean
    isDeleted?: boolean
}