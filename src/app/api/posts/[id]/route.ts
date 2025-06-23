import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  fullText: z.string().min(1).optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  externalLinks: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featuredImage: z.string().nullable().optional(),
  images: z.array(z.object({
    url: z.string(),
    aspectRatio: z.string(),
    baseFilename: z.string().optional(),
    originalUrl: z.string().optional(),
    isExisting: z.boolean().optional()
  })).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
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

    // Handle optional fields
    if (data.fullText !== undefined) updateData.fullText = data.fullText
    if (data.caption !== undefined) updateData.caption = data.caption
    if (data.description !== undefined) updateData.description = data.description
    if (data.externalLinks !== undefined) updateData.externalLinks = data.externalLinks
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date()
      }
    }

    // Handle category
    if (data.categoryId !== undefined) {
      if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } }
      } else {
        updateData.category = { disconnect: true }
      }
    }

    // Handle tags
    if (data.tagIds !== undefined) {
      updateData.tags = {
        set: data.tagIds.map(id => ({ id }))
      }
    }

    // Handle images
    if (data.images !== undefined) {
      if (data.images.length > 0) {
        const newImages = data.images.filter(img => !img.isExisting)
        updateData.images = newImages.map(img => ({
          url: img.url,
          aspectRatio: img.aspectRatio,
          baseFilename: img.baseFilename,
          originalUrl: img.originalUrl
        }))
      } else {
        updateData.images = []
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

    return successResponse(post, 'Post updated successfully')
  } catch (error) {
    console.error('Update post error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    )
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    // Check if post exists and user has permission
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    // Only allow authors to delete their own posts (admins can delete any)
    if (user.role !== 'ADMIN' && post.authorId !== user.id) {
      return errorResponse('Not authorized to delete this post', 403)
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Post deleted successfully')
  } catch (error) {
    console.error('Delete post error:', error)
    return errorResponse('Internal server error')
  }
} 