import { Router } from "express";
import { createDiscussion } from "../controller/v1/discussion_controller";

const router = Router()

router.post('/', createDiscussion)

export default router;