import { Router } from "express";
import { createDiscussion } from "../controller/discussion_controller";

const router = Router()

router.post('/', createDiscussion)

export default router;