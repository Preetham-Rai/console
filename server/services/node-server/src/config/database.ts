import mongoose from "mongoose";

export const connectToDB = async (): Promise<void> => {
    try {
        const url = process.env.DB_URL
        const dbName = process.env.DB_NAME

        if (!url) {
            throw new Error('URL is undefined')
        }

        await mongoose.connect(`${url}${dbName}`)
        console.log('DB Connection successful')

    } catch (error) {
        console.error(error)
    }
}