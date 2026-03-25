import type { Request, Response } from "express";
import { createUserService } from "./userService";

export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body
        const createUserResponse = await createUserService(userData)

        if (createUserResponse) {
            res.send(201).json(createUserResponse)
        }
    } catch (error) {
        if (error) {
            res.send(500).send({
                message: "Internal Server Errro"
            })
        }
    }
}