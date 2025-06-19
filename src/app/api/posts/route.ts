import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug, generateExcerpt } from '@/lib/utils'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const basePostSchema = z.object({
  title: z.string().min(1),
  fullText: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  externalLinks: z.string().url().optional(),
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
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

const createPostSchema = basePostSchema.refine(data => {
  // Either fullText or externalLinks must be provided
  return (data.fullText && data.fullText.trim().length > 0) || (data.externalLinks && data.externalLinks.trim().length > 0);
}, {
  message: "Either content or external link must be provided"
})

const updatePostSchema = basePostSchema.partial().refine(data => {
  // For updates, if both fields are provided in the update, validate them
  if (data.fullText !== undefined || data.externalLinks !== undefined) {
    return (data.fullText && data.fullText.trim().length > 0) || (data.externalLinks && data.externalLinks.trim().length > 0);
  }
  // If neither field is being updated, skip validation
  return true;
}, {
  message: "Either content or external link must be provided"
});

// GET /api/posts - Get all posts (role-based filtering)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | null
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    // Apply role-based filtering
    if (user.role === 'AUTHOR') {
      where.authorId = user.id
    }
    // ADMIN users can see all posts, so no additional filtering needed
    
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { fullText: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          category: {
            select: { id: true, name: true },
          },
          tags: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    
    const data = createPostSchema.parse(body)

    // Generate slug from title
    let slug = generateSlug(data.title)
    
    // Ensure slug is unique
    const existingPost = await prisma.post.findUnique({ where: { slug } })
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    // Generate excerpt if not provided
    const excerpt = data.fullText ? generateExcerpt(data.fullText) : undefined;

    const postData: any = {
      title: data.title,
      slug,
      fullText: data.fullText,
      excerpt,
      caption: data.caption,
      description: data.description,
      externalLinks: data.externalLinks,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      featuredImage: data.featuredImage,
      status: data.status,
      categoryId: data.categoryId,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      authorId: user.id,
    }

    // Add images if provided - only include new images (not existing ones)
    if (data.images && data.images.length > 0) {
      // Filter to only include new images that aren't marked as existing
      const newImages = data.images.filter(img => !img.isExisting)
      if (newImages.length > 0) {
        postData.images = newImages.map(img => ({
          url: img.url,
          aspectRatio: img.aspectRatio,
          baseFilename: img.baseFilename,
          originalUrl: img.originalUrl
        }))
      }
    }

    const post = await prisma.post.create({
      data: {
        ...postData,
        ...(data.tagIds && data.tagIds.length > 0 && {
          tags: {
            connect: data.tagIds.map(id => ({ id }))
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

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 