import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/routes'

const app = express();
dotenv.config()


app.use(express.json());
app.use(express.urlencoded())
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}))

app.use('/', router)


app.get('/health', (req: Request, res: Response) => {
    res.status(200).send({ status: "OK" })
})

export default app;