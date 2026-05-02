import { Worker } from "bullmq";
import { redisConfig } from "../config/redis";
import { JobTypes } from "../types/jobs";
import { emailProcessor } from "./processors/email_processor";

export const worker = new Worker(
    "app-queue",
    async (job) => {
        switch (job.name) {
            case JobTypes.SEND_EMAILS:
                return emailProcessor(job.data)
            default:
                throw new Error("Unknown job type");
        }
    },
    {
        connection: redisConfig
    }
)