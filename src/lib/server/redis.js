import Redis from 'ioredis';

const redis = new Redis(`rediss://default:${import.meta.env.VITE_REDIS_PASSWORD}@${import.meta.env.VITE_REDIS_HOST}:${import.meta.env.VITE_REDIS_PORT}`);

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
