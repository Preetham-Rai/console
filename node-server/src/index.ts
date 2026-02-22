import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv'
import { connectToDB } from './config/database';

dotenv.config()

const app: Application = express()
connectToDB()

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "Hello from the server"
    })
})

app.listen(3000, () => {
    console.log('Serve is running in http://localhost:3000')
})