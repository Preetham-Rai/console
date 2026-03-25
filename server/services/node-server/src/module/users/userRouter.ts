import { Router } from "express";
import { createUser } from "./userController";

const router = Router()


router.post('/', createUser)

export default router