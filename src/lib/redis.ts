import Redis from 'redis'

let redis: ReturnType<typeof Redis.createClient> | null = null

export const getRedisClient = () => {
  if (!redis) {
    redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    })

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redis.connect().catch(console.error)
  }

  return redis
}

export const setWithExpiration = async (key: string, value: string, expiration: number = 3600) => {
  const client = getRedisClient()
  await client.setEx(key, expiration, value)
}

export const get = async (key: string) => {
  const client = getRedisClient()
  return await client.get(key)
}

export const del = async (key: string) => {
  const client = getRedisClient()
  await client.del(key)
}

export const clearCache = async (pattern: string) => {
  const client = getRedisClient()
  const keys = await client.keys(pattern)
  if (keys.length > 0) {
    await client.del(keys)
  }
} 