import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const jobQueue = new Queue("app-queue", {
    connection: redisConfig
})