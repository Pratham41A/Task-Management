import { createClient } from 'redis';


export var redisDbClient

export async function connectRedisDb() {


    redisDbClient = createClient({
        url: process.env.REDIS_DB_URL
    });
    await redisDbClient.connect();

} 