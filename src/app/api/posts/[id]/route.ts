import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug, generateExcerpt } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'

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

    const data = updatePostSchema.parse(body)

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
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
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

    // Handle tags if provided
    if (data.tags) {
      updateData.tags = {
        set: [], // Clear existing connections
        connect: data.tags.map(tagId => ({ id: tagId }))
      }
    }

    // Handle images field - explicitly clear if empty array
    if (Array.isArray(data.images)) {
      if (data.images.length > 0) {
        // Filter to only include new images that aren't marked as existing
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