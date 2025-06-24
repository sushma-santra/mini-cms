import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug, generateExcerpt } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'
import { purgeCacheBySlug } from '@/lib/redis-cache'
import { logger } from '@/lib/logger'

const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  fullText: z.string().min(1, "Content is required").optional(),
  caption: z.string().max(500, "Caption must be less than 500 characters").optional(),
  description: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    aspectRatio: z.string(),
    baseFilename: z.string().optional(),
    originalUrl: z.string().optional(),
    isExisting: z.boolean().optional()
  })).optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional(),
  seoDescription: z.string().max(160, "SEO description must be less than 160 characters").optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  externalLinks: z.string().optional(),
})

// GET /api/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        tags: true,
      },
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    return successResponse(post, 'Post retrieved successfully')
  } catch (error) {
    console.error('Get post error:', error)
    return errorResponse('Internal server error')
  }
}

// PUT /api/posts/[id] - Update post
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
      data = updatePostSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse('Invalid input', 400, { details: error.errors })
      }
      throw error
    }

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, slug: true, title: true },
    })

    if (!existingPost) {
      return errorResponse('Post not found', 404)
    }

    // Role-based access control
    if (user.role === 'AUTHOR' && existingPost.authorId !== user.id) {
      return errorResponse('Access denied', 403)
    }

    // Prepare update data
    const updateData: any = {}

    if (data.title) {
      updateData.title = data.title
      // Regenerate slug if title changed
      if (data.title !== existingPost.title) {
        let newSlug = generateSlug(data.title)
        
        // Ensure slug is unique (excluding current post)
        const slugExists = await prisma.post.findFirst({
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

    if (data.fullText !== undefined) updateData.fullText = data.fullText
    if (data.caption !== undefined) updateData.caption = data.caption
    if (data.description !== undefined) updateData.description = data.description
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription
    if (data.externalLinks !== undefined) updateData.externalLinks = data.externalLinks
    if (data.categoryId) updateData.categoryId = data.categoryId
    
    if (data.status) {
      updateData.status = data.status
      // Set publishedAt when publishing
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }
    }

    // Handle images - only include new images (not existing ones)
    if (data.images !== undefined) {
      if (data.images.length > 0) {
        const newImages = data.images.filter(img => !img.isExisting)
        if (newImages.length > 0) {
          updateData.images = newImages.map(img => ({
            url: img.url,
            aspectRatio: img.aspectRatio,
            baseFilename: img.baseFilename,
            originalUrl: img.originalUrl
          }))
        }
      } else {
        updateData.images = []
      }
    }

    // Handle tags
    if (data.tags !== undefined) {
      updateData.tags = {
        set: [], // Clear existing tags
        connectOrCreate: data.tags.map(name => ({
          where: { name },
          create: { name }
        }))
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        tags: true,
      },
    })

    // Purge cache for both old and new slugs
    await Promise.all([
      purgeCacheBySlug(existingPost.slug),
      post.slug !== existingPost.slug ? purgeCacheBySlug(post.slug) : null
    ].filter(Boolean));

    logger.info(`Cache purged for post slugs: ${existingPost.slug}${post.slug !== existingPost.slug ? `, ${post.slug}` : ''}`);

    return successResponse(post, 'Post updated successfully')
  } catch (error) {
    console.error('Update post error:', error)
    return errorResponse('Internal server error')
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const { id } = params

    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, slug: true },
    })

    if (!existingPost) {
      return errorResponse('Post not found', 404)
    }

    // Role-based access control
    if (user.role === 'AUTHOR' && existingPost.authorId !== user.id) {
      return errorResponse('Access denied', 403)
    }

    await prisma.post.delete({
      where: { id },
    })

    // Purge cache for the deleted post
    await purgeCacheBySlug(existingPost.slug);
    logger.info(`Cache purged for deleted post slug: ${existingPost.slug}`);

    return successResponse(null, 'Post deleted successfully')
  } catch (error) {
    console.error('Delete post error:', error)
    return errorResponse('Internal server error')
  }
} 