import type { Request, Response } from "express";
import { loginUser, registerUser } from "../service/auth/auth_service";
import { UserModel } from "../model/user_model";
import { User } from "../types/user";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email }).select('+password');

        if (!user) return res.status(401).send({ message: 'Invalid Credentials' })

        const result = await loginUser(user, password)
        res.json(result)
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