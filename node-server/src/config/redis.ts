import { createClient } from "redis";
import Redis from "ioredis";
import logger from "./logger";

export const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD
}

export const redisConnection = async () => {
    const client = new Redis(redisConfig);
    return client
}

export const redisClient = createClient({
    url: "redis://localhost:6379"
})

redisClient.on("error", (err) => {
    logger.error(err)
})

export const connectRedis = async () => {
    await redisClient.connect();
    logger.info("Redis is connected")
}