import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
    user?: {
        userID: Types.ObjectId | null,
        role: string | null
    }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).send({ message: 'You are not authorised' })
    }

    const token = authorization?.split(' ')[1] as string

    try {
        const result = verifyAccessToken(token);
        req.user = {
            userID: result.userId,
            role: result.role
        }
        next()
    } catch (error) {
        return res.status(401).send({ message: 'Invalid Token' })
    }
}