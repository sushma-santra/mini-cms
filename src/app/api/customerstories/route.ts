import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug, generateExcerpt } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse, createPagination } from '@/lib/api-response'

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

const baseCustomerStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  date: z.string().datetime(),
  caption: z.string().max(500, "Caption must be less than 500 characters").optional(),
  description: z.string().optional(),
  mediaGallery: z.array(z.object({
    url: urlSchema,
    aspectRatio: z.string(),
    baseFilename: z.string().optional(),
    originalUrl: urlSchema.optional(),
    isExisting: z.boolean().optional()
  })).optional(),
  clientLogos: z.array(z.object({
    url: urlSchema,
    name: z.string().min(1, "Logo name is required"),
    isExisting: z.boolean().optional()
  })).optional(),
  stats: z.array(z.object({
    label: z.string().min(1, "Stat label is required"),
    value: z.string().min(1, "Stat value is required")
  })).optional(),
  contentSections: z.array(z.object({
    title: z.string().min(1, "Section title is required"),
    description: z.string().min(1, "Section description is required")
  })).optional(),
  seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional(),
  seoDescription: z.string().max(160, "SEO description must be less than 160 characters").optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  externalLink: z.string().url("Invalid external link URL").optional(),
  industry: z.enum([
    'TEAM',
    'BROADCASTERS_AND_OTT_PLATFORMS',
    'PUBLISHERS',
    'GAMING_OPERATORS',
    'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
    'DIGITAL_PLATFORMS',
    'FAN_DATA_AND_CRM_CONSULTING',
    'MARKETING_AND_COMMUNITY',
    'GAMING_AND_FAN_LOYALTY',
    'MANAGEMENT',
    'VIDEO_PRODUCTION',
    'SPORTS_DATA_SOLUTIONS'
  ]).default('TEAM'),
  solutions: z.array(z.enum([
    'TEAM',
    'BROADCASTERS_AND_OTT_PLATFORMS',
    'PUBLISHERS',
    'GAMING_OPERATORS',
    'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
    'DIGITAL_PLATFORMS',
    'FAN_DATA_AND_CRM_CONSULTING',
    'MARKETING_AND_COMMUNITY',
    'GAMING_AND_FAN_LOYALTY',
    'MANAGEMENT',
    'VIDEO_PRODUCTION',
    'SPORTS_DATA_SOLUTIONS'
  ])).default([]),
})

const createCustomerStorySchema = baseCustomerStorySchema.refine(data => {
  // Either contentSections or externalLink must be provided
  return (data.contentSections && data.contentSections.length > 0) || data.externalLink;
}, {
  message: "Either content sections or external link must be provided"
})

const updateCustomerStorySchema = baseCustomerStorySchema.partial()

// GET /api/customerstories - Get all customer stories (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | null
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')
    const industry = searchParams.get('industry')
    const solutions = searchParams.get('solutions')?.split(',').filter(Boolean)
    let userRole = 'PUBLIC'

    // Validate page and limit
    if (page < 1 || limit < 1 || limit > 100) {
      return successResponse(
        [],
        'Success',
        createPagination(1, 10, 0),
        { status, search, industry, solutions }
      )
    }

    let where: any = {
      status: 'PUBLISHED' // Only include published stories for public access
    }

    // Handle industry filter if valid
    if (industry) {
      try {
        const validIndustry = z.enum([
          'TEAM',
          'BROADCASTERS_AND_OTT_PLATFORMS',
          'PUBLISHERS',
          'GAMING_OPERATORS',
          'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
          'DIGITAL_PLATFORMS',
          'FAN_DATA_AND_CRM_CONSULTING',
          'MARKETING_AND_COMMUNITY',
          'GAMING_AND_FAN_LOYALTY',
          'MANAGEMENT',
          'VIDEO_PRODUCTION',
          'SPORTS_DATA_SOLUTIONS'
        ]).parse(industry)
        where.industry = validIndustry
      } catch (error) {
        // Invalid industry - return empty result instead of error
        return successResponse(
          [],
          'Success',
          createPagination(page, limit, 0),
          { status, search, industry, solutions }
        )
      }
    }

    // Handle solutions filter if valid
    if (solutions && solutions.length > 0) {
      try {
        const validSolutions = z.array(z.enum([
          'TEAM',
          'BROADCASTERS_AND_OTT_PLATFORMS',
          'PUBLISHERS',
          'GAMING_OPERATORS',
          'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
          'DIGITAL_PLATFORMS',
          'FAN_DATA_AND_CRM_CONSULTING',
          'MARKETING_AND_COMMUNITY',
          'GAMING_AND_FAN_LOYALTY',
          'MANAGEMENT',
          'VIDEO_PRODUCTION',
          'SPORTS_DATA_SOLUTIONS'
        ])).parse(solutions)
        where.solutions = { hasEvery: validSolutions }
      } catch (error) {
        // Invalid solutions - return empty result instead of error
        return successResponse(
          [],
          'Success',
          createPagination(page, limit, 0),
          { status, search, industry, solutions }
        )
      }
    }

    // If there's authentication, allow access to drafts based on role
    try {
      const user = await requireAuth(request)
      userRole = user.role
      if (user.role === 'ADMIN') {
        // Admin can see all stories
        where = {}
        if (status) where.status = status
      } else if (user.role === 'AUTHOR') {
        // Authors can see their own stories
        where = { authorId: user.id }
        if (status) where.status = status
      }
    } catch (error) {
      // No authentication or invalid token - continue with public access
    }

    // Handle specific customer story request by slug
    if (slug) {
      const customerStory = await prisma.customerStory.findUnique({
        where: { 
          ...where,
          slug 
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      if (!customerStory) {
        return errorResponse('Customer story not found', 404)
      }

      return successResponse(customerStory, 'Customer story retrieved successfully')
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [customerStories, total] = await Promise.all([
      prisma.customerStory.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          date: true,
          caption: true,
          description: true,
          seoTitle: true,
          seoDescription: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          mediaGallery: true,
          clientLogos: true,
          externalLink: true,
          industry: true,
          solutions: true,
          author: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customerStory.count({ where }),
    ])

    const filters = {
      status,
      search,
      industry,
      solutions,
      role: userRole
    }

    return successResponse(
      customerStories,
      'Customer stories retrieved successfully',
      createPagination(page, limit, total),
      filters
    )
  } catch (error) {
    console.error('Get customer stories error:', error)
    return errorResponse('Internal server error')
  }
}

// POST /api/customerstories - Create new customer story
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    
    let validatedData;
    try {
      validatedData = createCustomerStorySchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Invalid input', 400)
      }
      throw error
    }

    // Generate slug from title
    let slug = generateSlug(validatedData.title)
    
    // Ensure slug is unique
    const existingStory = await prisma.customerStory.findUnique({ where: { slug } })
    if (existingStory) {
      slug = `${slug}-${Date.now()}`
    }

    const customerStoryData = {
      title: validatedData.title,
      slug,
      date: validatedData.date ? new Date(validatedData.date) : new Date(),
      caption: validatedData.caption,
      description: validatedData.description,
      seoTitle: validatedData.seoTitle,
      seoDescription: validatedData.seoDescription,
      status: validatedData.status,
      industry: validatedData.industry,
      solutions: validatedData.solutions,
      externalLink: validatedData.externalLink,
      publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      authorId: user.id,
      mediaGallery: validatedData.mediaGallery,
      clientLogos: validatedData.clientLogos,
      stats: validatedData.stats,
      contentSections: validatedData.contentSections
    }

    try {
      const customerStory = await prisma.customerStory.create({
        data: customerStoryData,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })
      
      return successResponse(customerStory, 'Customer story created successfully')
    } catch (dbError) {
      throw dbError
    }
  } catch (error) {
    console.error('Create customer story error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
} 