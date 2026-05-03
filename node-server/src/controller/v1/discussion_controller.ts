import type { Request, Response } from "express";
import { Discussion } from "../../types/discussions/discussion";
import { dropDiscussion, editDiscussion, readAllDiscussions, writeDiscussion } from "../../service/discussion/discussion_service";
import logger from "../../config/logger";

// POST req
export const createDiscussion = async (req: Request<{}, {}, Discussion>, res: Response) => {
    try {
        const payload = req.body
        const user = req.user

        const isCreated = await writeDiscussion(payload, user)
        const statusCode = isCreated.status ? 200 : 400

        res.status(statusCode).json({
            message: isCreated.message
        })

    } catch (error: any) {
        logger.error("Error in [createDicussion]", {
            method: req.method,
            error
        })
        res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
            code: error.code || "INTERNAL_SERVER_ERROR"
        })
    }
}

// GET req
export const getAllDiscussions = async (req: Request, res: Response) => {
    try {
        const user = req.user

        const discussions = await readAllDiscussions(user)
        res.status(200).json({
            status: discussions.status,
            data: discussions.data,
            message: discussions.message
        })
    } catch (error: any) {
        logger.error("Error in [createDicussion]", {
            method: req.method,
            error
        })
        res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
            code: error.code || "INTERNAL_SERVER_ERROR"
        })
    }
}

// DELETE req
export const deleteDiscussion = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const discussionId = req.params.id

        const isDeleted = await dropDiscussion(discussionId, user)

        if (isDeleted) {
            res.status(200).json({
                status: isDeleted.status
            })
        }

    } catch (error: any) {
        logger.error("Error in [createDicussion]", {
            method: req.method,
            error
        })
        res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
            code: error.code || "INTERNAL_SERVER_ERROR"
        })
    }
}

// PUT req
export const updateDiscussion = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const discussionId = req.params.id
        const payload = req.body

        const isUpdated = await editDiscussion(discussionId, user, payload)

        if (isUpdated) {
            res.status(200).json({
                status: isUpdated.status
            })
        }

    } catch (error: any) {
        logger.error("Error in [createDicussion]", {
            method: req.method,
            error
        })
        res.status(error.statusCode || 500).json({
            message: error.message || "Something went wrong",
            code: error.code || "INTERNAL_SERVER_ERROR"
        })
    }
}