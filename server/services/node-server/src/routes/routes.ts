import { Router } from 'express';
import user from './user_routes'
import auth from './auth_routes'
import discussion from './discussion_routes'
import { authMiddleware } from '../middleware/auth_middleware';


const router = Router()

router.use('/api/user', user)
router.use('/api/auth', auth)
router.use('/api/discussion', authMiddleware, discussion)

export default router
