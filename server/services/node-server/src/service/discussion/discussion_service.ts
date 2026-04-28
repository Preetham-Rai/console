import logger from "../../config/logger"
import { jobQueue } from "../../jobs/queue"
import { DiscussionModel } from "../../model/discussions/discussion_model"
import { AuthUser } from "../../types/auth"
import { Discussion } from "../../types/discussions/discussion"
import { JobTypes } from "../../types/jobs"

export const writeDiscussion = async (payload: Discussion, user: AuthUser) => {
    try {
        const contentType = payload && payload.content && payload.content.type
        const userId = payload?.createdBy
        if (contentType === 'text') {
            if (payload && payload.content && payload.content.body && payload.content.body.length < 10) {
                const err = new Error("Content must be at least 10 characters long");
                (err as any).statusCode = 400;
                (err as any).code = "CONTENT_TOO_SHORT"

                throw err
            }
        }

        if (userId?.toString() !== user.id?.toString()) {
            const err = new Error("You are not authorized");
            (err as any).statusCode = 401;
            (err as any).code = "NOT_AUTHORIZED"

            throw err
        }

        const discussion = await DiscussionModel.create(payload)
        if (!discussion) {
            return {
                status: false,
                message: "Error while creating discussion"
            }
        }

        await jobQueue.add(JobTypes.SEND_EMAILS, "Joe Mokery")

        return {
            status: true,
            message: "Discussion created successfully"
        }
    } catch (error) {
        logger.error(error)
        return {
            status: false,
            message: "Error while creating discussion"
        }
    }
}