import type { Request, Response } from "express";
import { Discussion } from "../../types/discussions/discussion";
import { writeDiscussion } from "../../service/discussion/discussion_service";
import logger from "../../config/logger";

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