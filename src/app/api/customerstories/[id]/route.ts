import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'

const updateCustomerStorySchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  mediaGallery: z.array(z.object({
    url: z.string(),
    aspectRatio: z.string(),
    baseFilename: z.string().optional(),
    originalUrl: z.string().optional(),
    isExisting: z.boolean().optional(),
    featured: z.boolean().optional()
  })).optional(),
  stats: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1)
  })).optional(),
  contentSections: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1)
  })).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  externalLink: z.string().optional(),
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
  ]).optional(),
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
  ])).optional(),
  clientLogos: z.array(z.object({
    url: z.string(),
    name: z.string(),
    isExisting: z.boolean()
  })).optional(),
})

// GET /api/customerstories/[id] - Get specific customer story
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const { id } = params

    const customerStory = await prisma.customerStory.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        date: true,
        caption: true,
        description: true,
        mediaGallery: true,
        stats: true,
        contentSections: true,
        seoTitle: true,
        seoDescription: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        externalLink: true,
        industry: true,
        solutions: true,
        clientLogos: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!customerStory) {
      return errorResponse('Customer story not found', 404)
    }

    // Role-based access control
    if (user.role === 'AUTHOR' && customerStory.authorId !== user.id) {
      return errorResponse('Access denied', 403)
    }

    return successResponse(customerStory, 'Customer story retrieved successfully')
  } catch (error) {
    console.error('Get customer story error:', error)
    return errorResponse('Internal server error')
  }
}

// PUT /api/customerstories/[id] - Update customer story
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const { id } = params
    const body = await request.json()

    let data;
    try {
      data = updateCustomerStorySchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Invalid input', 400, { details: error.errors })
      }
      throw error
    }

    // Check if customer story exists and user has permission
    const existingStory = await prisma.customerStory.findUnique({
      where: { id },
      select: { id: true, authorId: true, slug: true, title: true },
    })

    if (!existingStory) {
      return errorResponse('Customer story not found', 404)
    }

    // Role-based access control
    if (user.role === 'AUTHOR' && existingStory.authorId !== user.id) {
      return errorResponse('Access denied', 403)
    }

    // Prepare update data
    const updateData: any = {}

    if (data.title) {
      updateData.title = data.title
      // Regenerate slug if title changed
      if (data.title !== existingStory.title) {
        let newSlug = generateSlug(data.title)
        
        // Ensure slug is unique (excluding current story)
        const slugExists = await prisma.customerStory.findFirst({
          where: { 
            slug: newSlug, 
            id: { not: id } 
          }
        })
        
        if (slugExists) {
          newSlug = `${newSlug}-${Date.now()}`
        }
        
        updateData.slug = newSlug
      }
    }

    if (data.date) updateData.date = new Date(data.date)
    if (data.caption !== undefined) updateData.caption = data.caption
    if (data.description !== undefined) updateData.description = data.description
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription
    if (data.externalLink !== undefined) updateData.externalLink = data.externalLink
    
    if (data.status) {
      updateData.status = data.status
      // Set publishedAt when publishing
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }
    }

    // Handle media gallery
    if (data.mediaGallery && Array.isArray(data.mediaGallery)) {
      // Preserve existing images and handle featured logic
      updateData.mediaGallery = data.mediaGallery.map((img: any) => ({
        url: img.url,
        aspectRatio: img.aspectRatio,
        baseFilename: img.baseFilename,
        originalUrl: img.originalUrl,
        featured: img.featured || false
      }));
      
      // Ensure only one featured image
      let hasFeatured = false;
      updateData.mediaGallery = updateData.mediaGallery.map((img: any) => {
        if (img.featured && !hasFeatured) {
          hasFeatured = true;
          return { ...img, featured: true };
        }
        return { ...img, featured: false };
      });
      
      // If no featured image, make first one featured
      if (!hasFeatured && updateData.mediaGallery.length > 0) {
        updateData.mediaGallery[0].featured = true;
      }
    } else {
      updateData.mediaGallery = [];
    }

    // Handle client logos
    if (data.clientLogos !== undefined) {
      if (data.clientLogos.length > 0) {
        updateData.clientLogos = data.clientLogos.map(logo => ({
          url: logo.url,
          name: logo.name,
          isExisting: false
        }))
      } else {
        updateData.clientLogos = []
      }
    }

    // Handle stats
    if (data.stats !== undefined) {
      updateData.stats = data.stats || []
    }

    // Handle content sections
    if (data.contentSections !== undefined) {
      updateData.contentSections = data.contentSections || []
    }

    // Handle industry and solutions
    if (data.industry !== undefined) {
      updateData.industry = data.industry
    }

    if (data.solutions !== undefined) {
      updateData.solutions = data.solutions
    }

    const customerStory = await prisma.customerStory.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        slug: true,
        date: true,
        caption: true,
        description: true,
        mediaGallery: true,
        stats: true,
        contentSections: true,
        seoTitle: true,
        seoDescription: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        externalLink: true,
        industry: true,
        solutions: true,
        clientLogos: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return successResponse(customerStory, 'Customer story updated successfully')
  } catch (error) {
    console.error('Update customer story error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
}

// DELETE /api/customerstories/[id] - Delete customer story
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const { id } = params

    // Check if customer story exists and user has permission
    const existingStory = await prisma.customerStory.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Customer story not found' },
        { status: 404 }
      )
    }

    // Role-based access control
    if (user.role === 'AUTHOR' && existingStory.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    await prisma.customerStory.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Customer story deleted successfully' })
  } catch (error) {
    console.error('Delete customer story error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 