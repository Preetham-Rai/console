import { createClient } from "redis";
import logger from "./logger";

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