import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse, createPagination } from '@/lib/api-response'
import { eventDetailSelect, eventListSelect, eventApiSchema } from '@/lib/schemas/event'
import { Prisma, PostStatus } from '@prisma/client'

// Custom URL validator that accepts both absolute and relative URLs
const urlSchema = z.string().refine(
  (url) => {
    // Accept absolute URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }
    // Accept relative URLs that start with / and contain no spaces
    return url.startsWith('/') && !url.includes(' ')
  },
  { message: 'Invalid URL' }
)

const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  external_link: z.string().url("Invalid external link URL").optional(),
  country: z.string().max(100, "Country must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  venue: z.string().max(200, "Venue must be less than 200 characters").optional(),
  booth: z.string().max(50, "Booth must be less than 50 characters").optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  start_time: z.string().max(10, "Start time must be less than 10 characters").optional(),
  end_time: z.string().max(10, "End time must be less than 10 characters").optional(),
  join_us_link: z.string().url("Invalid join us link URL").optional(),
  image: z.object({
    url: urlSchema,
    aspectRatio: z.string(),
    baseFilename: z.string().optional(),
    originalUrl: urlSchema.optional(),
    isExisting: z.boolean().optional()
  }).optional(),
  event_highlights: z.array(z.object({
    title: z.string().min(1, "Highlight title is required"),
    description: z.string().min(1, "Highlight description is required")
  })).optional(),
  event_map_embed: z.string().optional(),
  event_details: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})

const updateEventSchema = baseEventSchema.partial()

// GET /api/events - Get all events (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')
    let userRole = 'PUBLIC'
    let currentUser = null

    // Validate page and limit
    if (page < 1 || limit < 1 || limit > 100) {
      return successResponse(
        [],
        'Invalid pagination parameters',
        createPagination(1, 10, 0),
        { status, search }
      )
    }

    let where: any = {
      status: 'PUBLISHED' // Only include published events for public access
    }

    // If there's authentication, allow access to drafts based on role
    try {
      const user = await requireAuth(request)
      currentUser = user
      userRole = user.role
      if (user.role === 'ADMIN') {
        // Admin can see all events
        where = {}
        if (status) where.status = status
      } else if (user.role === 'AUTHOR') {
        // Authors can see their own events
        where = { authorId: user.id }
        if (status) where.status = status
      }
    } catch (error) {
      // No authentication or invalid token - continue with public access
    }

    // Handle specific event request by slug
    if (slug) {
      const event = await prisma.event.findFirst({
        where: {
          slug,
          ...(userRole === 'PUBLIC' ? { status: 'PUBLISHED' } : {}),
          ...(userRole === 'AUTHOR' && currentUser ? { authorId: currentUser.id } : {})
        },
        select: eventDetailSelect,
      })

      if (!event) {
        return errorResponse('Event not found', 404)
      }

      return successResponse(event, 'Event retrieved successfully')
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { event_details: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy: Prisma.EventOrderByWithRelationInput[] = [
      { updatedAt: 'desc' },
      { start_date: 'asc' }
    ]

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: eventListSelect,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    const filters = {
      status,
      search,
      role: userRole
    }

    return successResponse(
      events,
      'Events retrieved successfully',
      createPagination(page, limit, total),
      filters
    )
  } catch (error) {
    console.error('Get events error:', error)
    return errorResponse('Failed to retrieve events', 500)
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()

    let validatedData;
    try {
      validatedData = eventApiSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Invalid input', 400, { details: error.errors })
      }
      throw error
    }

    // Generate unique slug
    let slug = validatedData.slug || generateSlug(validatedData.title)
    if (!slug) {
      slug = generateSlug(validatedData.title)
    }

    const slugExists = await prisma.event.findFirst({
      where: { slug }
    })

    if (slugExists) {
      slug = `${slug}-${Date.now()}`
    }

    const { start_date, end_date, ...restOfData } = validatedData;

    // Validate date range
    if (new Date(end_date) < new Date(start_date)) {
      return errorResponse('End date must be after start date', 400)
    }

    const { image, ...restOfValidatedData } = validatedData;

    const eventData = {
      ...restOfValidatedData,
      slug,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      authorId: user.id,
      publishedAt: validatedData.status === PostStatus.PUBLISHED ? new Date() : null,
      image: image || Prisma.JsonNull,
    }

    const event = await prisma.event.create({
      data: eventData,
      select: eventDetailSelect
    })

    return successResponse(event, 'Event created successfully')
  } catch (error) {
    console.error('Create event error:', error)
    return errorResponse('Failed to create event', 500)
  }
} 