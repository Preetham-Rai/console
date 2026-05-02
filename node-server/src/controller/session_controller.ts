import type { Request, Response } from "express";
import { validateTokenAndReturn } from "../service/app/session_service";
import { Types } from "mongoose";

interface SessionToken {
    refreshToken: string
    userID: Types.ObjectId
}

export const refresh = async (req: Request<{}, {}, SessionToken>, res: Response) => {
    try {
        const { refreshToken, userID } = req.body

        if (!refreshToken) return res.status(401)

        const response = validateTokenAndReturn(refreshToken, userID);

    } catch (error) {

    }
}