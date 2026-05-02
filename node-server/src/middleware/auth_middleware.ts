import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UserModel } from "../model/user_model";
import logger from "../config/logger";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).send({ message: 'You are not authorised' })
    }

    const token = authorization?.split(' ')[1] as string

    try {
        const result = verifyAccessToken(token);
        const user = await UserModel.findOne({ _id: result.userId })
        req.user = {
            id: user?.id,
            email: user?.email,
            isActive: user?.isActive,
            role: user?.role,
            isEmailVerified: user?.isEmailVerified,
            permissions: user?.permissions,
            username: user?.username
        }
        next()
    } catch (error) {
        logger.error(error)
        return res.status(401).send({ message: 'Invalid Token' })
    }
}