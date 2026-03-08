import express, { Request, Response } from 'express'
import cors from 'cors'
import userRouter from './module/users/userRouter'
import authRouter from './module/auth/authRouter'
import dotenv from 'dotenv'

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

app.get('/health', (req: Request, res: Response) => {
    res.status(200).send({ status: "OK" })
})

export default app;