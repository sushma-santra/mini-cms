import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse, createPagination } from '@/lib/api-response'
import { Prisma } from '@prisma/client'

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
    if (url.startsWith('/') && !url.includes(' ')) {
      return true
    }
    // Accept URLs that start with 'images/' (uploaded images)
    if (url.startsWith('images/') && !url.includes(' ')) {
      return true
    }
    return false
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
    isExisting: z.boolean().optional(),
    featured: z.boolean().optional()
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
    'LEAGUES_AND_FEDERATIONS',
    'TEAM',
    'BROADCASTERS_AND_OTT_PLATFORMS',
    'PUBLISHERS',
    'GAMING_OPERATORS'
  ]).default('TEAM'),
  solutions: z.array(z.enum([
    'GAMING_AND_FAN_LOYALTY',
    'DIGITAL_PLATFORMS',
    'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
    'FAN_DATA_AND_CRM_CONSULTING',
    'MARKETING_AND_COMMUNITY_MANAGEMENT',
    'DESIGN_AND_VIDEO_PRODUCTION',
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
          'LEAGUES_AND_FEDERATIONS',
          'TEAM',
          'BROADCASTERS_AND_OTT_PLATFORMS',
          'PUBLISHERS',
          'GAMING_OPERATORS'
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
          'GAMING_AND_FAN_LOYALTY',
          'DIGITAL_PLATFORMS',
          'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
          'FAN_DATA_AND_CRM_CONSULTING',
          'MARKETING_AND_COMMUNITY_MANAGEMENT',
          'DESIGN_AND_VIDEO_PRODUCTION',
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
        console.error('Customer story validation error:', error.errors)
        console.error('Request body:', JSON.stringify(body, null, 2))
        return errorResponse('Invalid input', 400, { details: error.errors })
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

    // Enforce only one featured image in mediaGallery
    if (customerStoryData.mediaGallery && Array.isArray(customerStoryData.mediaGallery) && customerStoryData.mediaGallery.length > 0) {
      let found = false;
      customerStoryData.mediaGallery = customerStoryData.mediaGallery.map(img => {
        if (img.featured && !found) {
          found = true;
          return { ...img, featured: true };
        }
        return { ...img, featured: false };
      });
      if (!found) {
        customerStoryData.mediaGallery[0].featured = true;
      }
    } else {
      // Only set to empty array if it's undefined/null, not if it's already an array
      if (!customerStoryData.mediaGallery) {
        customerStoryData.mediaGallery = [];
      }
    }

    // Ensure other arrays are properly handled
    if (!Array.isArray(customerStoryData.stats)) customerStoryData.stats = [];
    if (!Array.isArray(customerStoryData.clientLogos)) customerStoryData.clientLogos = [];
    if (!Array.isArray(customerStoryData.contentSections)) customerStoryData.contentSections = [];



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

// PUT /api/customerstories - Update an existing customer story
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    
    let validatedData;
    try {
      validatedData = updateCustomerStorySchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Invalid input', 400)
      }
      throw error
    }

    // Find the existing customer story
    const customerStory = await prisma.customerStory.findUnique({
      where: { id: body.id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!customerStory) {
      return errorResponse('Customer story not found', 404)
    }

    // Process mediaGallery to ensure featured image logic and proper type handling
    let processedMediaGallery = validatedData.mediaGallery || customerStory.mediaGallery
    
    // Enforce only one featured image in mediaGallery
    if (Array.isArray(processedMediaGallery) && processedMediaGallery.length > 0) {
      let found = false;
      processedMediaGallery = processedMediaGallery.map((img: any) => {
        if (img && typeof img === 'object' && 'featured' in img) {
          if (img.featured && !found) {
            found = true;
            return { ...img, featured: true };
          }
          return { ...img, featured: false };
        }
        return img;
      });
      
      // If no featured image found, set the first one as featured
      if (!found && processedMediaGallery.length > 0 && typeof processedMediaGallery[0] === 'object' && processedMediaGallery[0] !== null) {
        processedMediaGallery[0] = { ...processedMediaGallery[0], featured: true };
      }
    }

    // Update the customer story data
    const updateData: any = {
      title: validatedData.title || customerStory.title,
      date: validatedData.date || customerStory.date,
      caption: validatedData.caption || customerStory.caption,
      description: validatedData.description || customerStory.description,
      mediaGallery: processedMediaGallery,
      clientLogos: validatedData.clientLogos || customerStory.clientLogos,
      stats: validatedData.stats || customerStory.stats,
      contentSections: validatedData.contentSections || customerStory.contentSections,
      seoTitle: validatedData.seoTitle || customerStory.seoTitle,
      seoDescription: validatedData.seoDescription || customerStory.seoDescription,
      status: validatedData.status || customerStory.status,
      externalLink: validatedData.externalLink || customerStory.externalLink,
      industry: validatedData.industry || customerStory.industry,
      solutions: validatedData.solutions || customerStory.solutions,
    }

    // Ensure arrays are properly handled - only reset if truly null/undefined
    if (!updateData.mediaGallery) updateData.mediaGallery = []
    if (!Array.isArray(updateData.stats)) updateData.stats = []
    if (!Array.isArray(updateData.clientLogos)) updateData.clientLogos = []
    if (!Array.isArray(updateData.contentSections)) updateData.contentSections = []

    try {
      const updatedCustomerStory = await prisma.customerStory.update({
        where: { id: body.id },
        data: updateData,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })
      
      return successResponse(updatedCustomerStory, 'Customer story updated successfully')
    } catch (dbError) {
      throw dbError
    }
  } catch (error) {
    console.error('Update customer story error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
} 