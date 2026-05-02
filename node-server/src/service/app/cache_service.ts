import { redisClient } from "../../config/redis";

export class CacheService {
    async get<T>(key: string): Promise<T | null> {
        const data = await redisClient.get(key)
        return data ? JSON.parse(data) : null
    }

    async set(key: string, value: unknown, ttlSeconds?: number) {
        await redisClient.set(key, JSON.stringify(value), {
            EX: ttlSeconds || 60
        })
    }

    async delete(key: string) {
        await redisClient.del(key)
    }
}