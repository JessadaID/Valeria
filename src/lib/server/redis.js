import Redis from 'ioredis';

// Create a Redis client instance
const redis = new Redis({
    host: 'localhost',
    port: 6379,
    // password: 'MyStrongPassword123', 
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
