import type { Request, Response } from "express";
import { Discussion } from "../types/discussion";
import { writeDiscussion } from "../service/discussion_service";

export const createDiscussion = async (req: Request<{}, {}, Discussion>, res: Response) => {
    try {
        const payload = req.body

        const isCreated = await writeDiscussion(payload)
        const statusCode = isCreated.status ? 200 : 400

        res.status(statusCode).json({
            message: "Discussion is created successfully"
        })

    } catch (error) {
        console.error(error)
    }
}