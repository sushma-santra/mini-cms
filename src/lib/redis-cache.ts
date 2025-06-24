import { createClient } from 'redis';
import { logger } from './logger';

// Redis client singletons
let writeClient: ReturnType<typeof createClient> | null = null;
let readClient: ReturnType<typeof createClient> | null = null;

interface RedisConfig {
  url: string;
  username?: string;
  password?: string;
}

/**
 * Get Redis configuration based on operation type
 */
function getRedisConfig(operation: 'read' | 'write'): RedisConfig {
  const isProd = process.env.NODE_ENV === 'production';
  const isStaging = process.env.NODE_ENV === 'staging';

  if (isProd || isStaging) {
    return {
      url: operation === 'write' 
        ? process.env.REDIS_WRITE_URL! 
        : process.env.REDIS_READ_URL!,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    };
  }

  // Development environment uses a single Redis instance
  return {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  };
}

/**
 * Get Redis client for write operations
 */
export async function getWriteClient() {
  if (writeClient) return writeClient;

  const config = getRedisConfig('write');
  
  writeClient = createClient(config);

  writeClient.on('error', (err) => {
    logger.error('Redis Write Client Error', err);
  });

  await writeClient.connect();
  logger.info('Redis write client connected');
  return writeClient;
}

/**
 * Get Redis client for read operations
 */
export async function getReadClient() {
  if (readClient) return readClient;

  const config = getRedisConfig('read');
  
  readClient = createClient(config);

  readClient.on('error', (err) => {
    logger.error('Redis Read Client Error', err);
  });

  await readClient.connect();
  logger.info('Redis read client connected');
  return readClient;
}

// Cache key prefixes
const CACHE_PREFIXES = {
  CONTENT: 'content:',
  CUSTOMER_STORIES: 'customer-stories:',
} as const;

// Cache TTL in seconds (24 hours)
const DEFAULT_CACHE_TTL = 86400;

/**
 * Get data from cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const redis = await getReadClient();
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set data in cache with TTL
 */
export async function setToCache(key: string, data: any, ttl = DEFAULT_CACHE_TTL): Promise<void> {
  try {
    const redis = await getWriteClient();
    await redis.setEx(key, ttl, JSON.stringify(data));
    logger.info(`Cache set for key: ${key}`);
  } catch (error) {
    logger.error('Redis set error:', error);
  }
}

/**
 * Generate cache key for content API
 */
export function getContentCacheKey(url: string): string {
  return `${CACHE_PREFIXES.CONTENT}${url}`;
}

/**
 * Generate cache key for customer stories API
 */
export function getCustomerStoriesCacheKey(url: string): string {
  return `${CACHE_PREFIXES.CUSTOMER_STORIES}${url}`;
}

/**
 * Purge cache by pattern
 */
export async function purgeCacheByPattern(pattern: string): Promise<void> {
  try {
    const redis = await getWriteClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Purged ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Redis purge error:', error);
  }
}

/**
 * Purge all content and customer stories cache
 */
export async function purgeAllCache(): Promise<void> {
  try {
    await Promise.all([
      purgeCacheByPattern(`${CACHE_PREFIXES.CONTENT}*`),
      purgeCacheByPattern(`${CACHE_PREFIXES.CUSTOMER_STORIES}*`)
    ]);
    logger.info('Purged all content and customer stories cache');
  } catch (error) {
    logger.error('Redis purge all error:', error);
  }
}

/**
 * Purge cache by slug
 */
export async function purgeCacheBySlug(slug: string): Promise<void> {
  await Promise.all([
    purgeCacheByPattern(`${CACHE_PREFIXES.CONTENT}*${slug}*`),
    purgeCacheByPattern(`${CACHE_PREFIXES.CUSTOMER_STORIES}*${slug}*`)
  ]);
}

/**
 * Gracefully close Redis connections
 */
export async function closeRedisConnections(): Promise<void> {
  try {
    if (readClient) {
      await readClient.quit();
      readClient = null;
      logger.info('Redis read client disconnected');
    }
    if (writeClient) {
      await writeClient.quit();
      writeClient = null;
      logger.info('Redis write client disconnected');
    }
  } catch (error) {
    logger.error('Error closing Redis connections:', error);
  }
} 