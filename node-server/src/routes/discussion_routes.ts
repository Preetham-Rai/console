import { Router } from "express";
import { createDiscussion, deleteDiscussion, getAllDiscussions, updateDiscussion } from "../controller/v1/discussion_controller";

const router = Router()

router.route('/')
    .get(getAllDiscussions)
    .post(createDiscussion)

router.route('/:id')
    .delete(deleteDiscussion)
    .put(updateDiscussion)

export default router;