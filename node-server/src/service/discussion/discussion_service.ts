import { tryCatch } from "bullmq"
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

export const readAllDiscussions = async (user: AuthUser) => {
    try {
        const isAuthorized = user.permissions?.includes('read')

        if (!isAuthorized) {
            const err = new Error('User is not authorized to view the discussion');
            (err as any).statusCode = 403;
            (err as any).code = "NOT_AUTHORIZED"

            throw err
        }

        const discussions = await DiscussionModel.find({})

        if (!discussions) {
            return {
                status: false,
                data: null,
                message: "Falied to fetch all discussion"
            }
        }

        return {
            status: true,
            data: discussions,
            message: "Discussion fetched successfully"
        }

    } catch (error) {
        logger.error(error)
        return {
            status: false,
            data: null,
            message: "Error while fetching Discussion"
        }
    }
}

export const dropDiscussion = async (id: string | string[], user: AuthUser) => {
    try {
        const discussions = await DiscussionModel.findByIdAndDelete(id)

        if (!discussions) {
            return {
                status: false,
                message: "Falied to delete discussion"
            }
        }

        return {
            status: true,
            message: "Discussion deleted successfully"
        }

    } catch (error) {
        logger.error(error)
        return {
            status: false,
            message: "Error while deleting Discussion"
        }
    }
}

export const editDiscussion = async (id: string | string[], user: AuthUser, payload: any) => {
    try {
        const discussions = await DiscussionModel.findByIdAndUpdate(id, payload, { new: true })

        if (!discussions) {
            return {
                status: false,
                message: "Falied to update discussion"
            }
        }

        return {
            status: true,
            message: "Discussion updated successfully"
        }

    } catch (error) {
        logger.error(error)
        return {
            status: false,
            message: "Error while updating Discussion"
        }
    }
}