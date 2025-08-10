const redis = require('redis');

let redisClient = null;
let disabled = false;

const connectRedis = async () => {
  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = redis.createClient({ url });

    redisClient.on('error', (err) => {
      console.warn('Redis not available, continuing without cache:', err.message);
      disabled = true;
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis connection failed, continuing without cache:', error.message);
    disabled = true;
    return null;
  }
};

const getRedisClient = () => {
  if (disabled || !redisClient) return null;
  return redisClient;
};

const setCache = async (key, value, expireTime = 3600) => {
  if (disabled) return false;
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.setEx(key, expireTime, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const getCache = async (key) => {
  if (disabled) return null;
  try {
    const client = getRedisClient();
    if (!client) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const deleteCache = async (key) => {
  if (disabled) return false;
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.del(key);
    return true;
  } catch {
    return false;
  }
};

const clearCache = async () => {
  if (disabled) return false;
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.flushAll();
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache
}; 