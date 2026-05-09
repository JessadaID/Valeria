import Redis from 'ioredis';

const redis = new Redis({
    host: import.meta.env.VITE_REDIS_HOST,
    port: import.meta.env.VITE_REDIS_PORT,
    password: import.meta.env.VITE_REDIS_PASSWORD,
});

redis.on('connect', () => {
    console.log('Redis connected!');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('ready', () => {
    console.log('Redis is ready to use');
});

export default redis;
