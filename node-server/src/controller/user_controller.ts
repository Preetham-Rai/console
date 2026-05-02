import type { Request, Response } from "express";
import { registerUser } from "../service/user/user_service";
import logger from "../config/logger";

export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body
        const createUserResponse = await registerUser(userData)

        if (createUserResponse.status) {
            res.send(201).json({
                message: "User is created"
            })
        }
    } catch (error: any) {
        logger.error(error)
        res.status(error.statusCode || 500).send({
            message: error.message || "Internal Server Error",
            code: error.code || "INTERAL_SERVER_ERROR"
        })
    }
}