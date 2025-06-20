import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug, generateExcerpt } from '@/lib/utils'
import { z } from 'zod'

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
  categoryId: z.string().optional(),
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
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const data = updatePostSchema.parse(body)

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user can edit this post (author or admin)
    if (existingPost.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = { ...data }
    delete updateData.tagIds // Remove tagIds from direct update data
    
    // Handle featuredImage field - explicitly clear if null
    if (data.featuredImage === null) {
      updateData.featuredImage = null
    }
    
    // Handle images field properly - replace with current image state
    if (data.images !== undefined) {
      if (data.images === null || (Array.isArray(data.images) && data.images.length === 0)) {
        // No images provided - clear the images field
        updateData.images = []
      } else {
        // Separate existing images from new images
        const existingImages = data.images.filter(img => img.isExisting)
        const newImages = data.images.filter(img => !img.isExisting)
        
        // The final images array should only contain:
        // 1. Existing images that are still present in the frontend state
        // 2. New images that were just uploaded
        updateData.images = [
          // Existing images (already in correct format)
          ...existingImages.map(img => ({
            url: img.url,
            aspectRatio: img.aspectRatio,
            baseFilename: img.baseFilename,
            originalUrl: img.originalUrl  // Include original URL
          })),
          // New images (also in correct format)
          ...newImages.map(img => ({
            url: img.url,
            aspectRatio: img.aspectRatio,
            baseFilename: img.baseFilename,
            originalUrl: img.originalUrl  // Include original URL
          }))
        ]
      }
    }

    // Generate new slug if title changed
    if (data.title && data.title !== existingPost.title) {
      let slug = generateSlug(data.title)
      
      // Ensure slug is unique (exclude current post)
      const slugExists = await prisma.post.findFirst({
        where: { 
          slug, 
          id: { not: params.id } 
        },
      })
      
      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
      
      updateData.slug = slug
    }

    // Generate new excerpt if fullText changed
    if (data.fullText) {
      updateData.excerpt = generateExcerpt(data.fullText)
    }

    // Set publishedAt if status changed to PUBLISHED
    if (data.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(data.tagIds !== undefined && {
          tags: {
            set: data.tagIds.map(id => ({ id }))
          }
        })
      },
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

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user can delete this post (author or admin)
    if (existingPost.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 