import mongoose from "mongoose";
import logger from "./logger";

export const connectToDB = async (): Promise<void> => {
    try {
        const url = process.env.DB_URL
        const dbName = process.env.DB_NAME

        if (!url) {
            throw new Error('URL is undefined')
        }

        await mongoose.connect(`${url}${dbName}`)
        logger.info("Database is connected succesfully")

    } catch (error) {
        console.error(error)
        logger.error("Error while connecting to db", {
            error,
        })
    }
}