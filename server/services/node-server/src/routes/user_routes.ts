import { Router } from "express";
import { createUser } from "../controller/user_controller";

const router = Router()

router.post('/', createUser)

export default router