import mongoose from "mongoose";
import { seedTags } from "../database/seeders/seedTags";
import dotenv from 'dotenv'

dotenv.config()

async function run() {
    await mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`) // TODO: relace connection string with env vars
    console.log("Seeding is starting")

    await seedTags()
    console.log("✅ Seeding finished");

    process.exit(0);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
})