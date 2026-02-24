import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv'
import { connectToDB } from './config/database';
import cors from 'cors'
import userRouter from './module/users/userRouter'
import authRouter from './module/auth/authRouter'

dotenv.config()

const app: Application = express()
connectToDB()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}))

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "Hello from the server"
    })
})

app.listen(3000, () => {
    console.log('Serve is running in http://localhost:3000')
})