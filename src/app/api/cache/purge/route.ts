import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { purgeCacheBySlug, purgeAllCache } from '@/lib/redis-cache'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const purgeSchema = z.object({
  slugs: z.array(z.string()).optional(),
  purgeAll: z.boolean().optional(),
}).refine(data => data.slugs || data.purgeAll, {
  message: "Either slugs or purgeAll must be provided"
});

// POST /api/cache/purge - Purge cache entries
export async function POST(request: NextRequest) {
  try {
    // Only admins can purge cache
    const user = await requireAuth(request)
    if (user.role !== 'ADMIN') {
      return errorResponse('Access denied. Admin role required.', 403)
    }

    const body = await request.json()
    
    let data;
    try {
      data = purgeSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Invalid input', 400, { details: error.errors })
      }
      throw error
    }

    if (data.purgeAll) {
      await purgeAllCache()
      return successResponse(null, 'All cache entries purged successfully')
    }

    if (data.slugs && data.slugs.length > 0) {
      await Promise.all(data.slugs.map(slug => purgeCacheBySlug(slug)))
      return successResponse(null, `Cache purged for slugs: ${data.slugs.join(', ')}`)
    }

    return errorResponse('No action taken', 400)
  } catch (error) {
    logger.error('Cache purge error:', error)
    return errorResponse('Internal server error')
  }
} 