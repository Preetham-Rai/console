import type { Request, Response } from "express";
import { loginUser } from "./authService";
import { UserModel } from "../users/user.schema";

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