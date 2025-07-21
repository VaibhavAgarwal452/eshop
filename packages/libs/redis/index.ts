import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({});

const redis = new Redis(process.env.REDIS_URL!, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

// Handle Redis connection errors gracefully
redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

redis.on('ready', () => {
  console.log('Redis is ready');
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

export default redis;
