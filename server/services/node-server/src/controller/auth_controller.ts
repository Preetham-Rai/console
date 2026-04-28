import type { Request, Response } from "express";
import { loginUser, registerUser } from "../service/auth/auth_service";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password)
        const statusCode = result.status ? 200 : 401

        res.status(statusCode).json({
            userId: result.userId,
            status: result.status,
            accessToken: result.token,
            refreshToken: result.refreshToken,
            message: result.message
        })
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const payload = req.body;

        const response = await registerUser(payload)
        const statusCode = response.status ? 201 : 400

        res.status(statusCode).json({ message: response.message });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
}