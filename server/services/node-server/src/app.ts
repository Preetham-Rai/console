import express, { Request, Response } from 'express'
import cors from 'cors'
import userRouter from './routes/user_routes'
import authRouter from './routes/auth_routes'
import discussionRouter from './routes/discussion_routes'
import dotenv from 'dotenv'
import { authMiddleware } from './middleware/auth_middleware'

const app = express();
dotenv.config()


app.use(express.json());
app.use(express.urlencoded())
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}))


app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/discussion', authMiddleware, discussionRouter)

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send({ status: "OK" })
})

export default app;