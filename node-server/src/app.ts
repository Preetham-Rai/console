import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes/routes'
import logger from './config/logger';
import { loggerMiddleware } from './middleware/logger_middleware';

const app = express();
dotenv.config()

app.use(express.json());
app.use(express.urlencoded())
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}))
app.use(loggerMiddleware)

app.use('/', router)

app.get('/health', (req: Request, res: Response) => {
    logger.info("Health Check", {
        method: req.method
    })
    res.status(200).send({ status: "OK" })
})

export default app;