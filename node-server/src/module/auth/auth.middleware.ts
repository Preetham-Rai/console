import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(500).send({ message: 'Server Error no token found' })
    }

    const token = authorization?.split(' ')[1] as string

    try {
        const result = verifyToken(token);
        if (result) res.status(304)
        next()
    } catch (error) {
        return res.status(401).send({ message: 'Invalid Token' })
    }
}