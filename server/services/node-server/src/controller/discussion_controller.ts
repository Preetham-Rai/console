import type { Request, Response } from "express";
import { Discussion } from "../types/discussion";
import { writeDiscussion } from "../service/discussion_service";
import { jobQueue } from "../jobs/queue";
import { JobTypes } from "../types/jobs";

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
        console.error(error)
    }
}