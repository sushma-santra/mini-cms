import { createClient } from 'redis';
import { logger } from './logger';

// Redis client singleton
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (client) return client;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  
  client = createClient({
    url,
  });

  client.on('error', (err) => {
    logger.error('Redis Client Error', err);
  });

  await client.connect();
  return client;
}

// Cache utilities
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient();
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

export async function setToCache(key: string, data: any, ttl = 86400): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    logger.error('Redis set error:', error);
  }
}

export async function purgeCacheByPattern(pattern: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Purged ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Redis purge error:', error);
  }
}

export async function purgeAllCache(): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.flushDb();
    logger.info('Purged all cache entries');
  } catch (error) {
    logger.error('Redis purge all error:', error);
  }
}

// Cache key generators
export function getContentCacheKey(url: string): string {
  return `content:${url}`;
}

export function getCustomerStoriesCacheKey(url: string): string {
  return `customer-stories:${url}`;
}

// Content-specific purge utilities
export async function purgeCacheBySlug(slug: string): Promise<void> {
  await Promise.all([
    purgeCacheByPattern(`content:*${slug}*`),
    purgeCacheByPattern(`customer-stories:*${slug}*`)
  ]);
} 