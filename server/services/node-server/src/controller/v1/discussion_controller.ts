import type { Request, Response } from "express";
import { Discussion } from "../../types/discussions/discussion";
import { writeDiscussion } from "../../service/discussion_service";
import { jobQueue } from "../../jobs/queue";
import { JobTypes } from "../../types/jobs";
import logger from "../../config/logger";

export const createDiscussion = async (req: Request<{}, {}, Discussion>, res: Response) => {
    try {
        const payload = req.body

        const isCreated = await writeDiscussion(payload)
        const statusCode = isCreated.status ? 200 : 400

        res.status(statusCode).json({
            message: "Discussion is created successfully"
        })

        await jobQueue.add(JobTypes.SEND_EMAILS, "Joe Mokery")

    } catch (error) {
        ``
        logger.error("Error in [createDicussion]", {
            method: req.method,
            error
        })
    }
}