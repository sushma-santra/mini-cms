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

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  fullText: z.string().min(1, "Content is required"),
  caption: z.string().max(500, "Caption must be less than 500 characters").optional(),
  description: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    aspectRatio: z.string(),
    baseFilename: z.string().optional(),
    originalUrl: z.string().optional(),
    isExisting: z.boolean().optional()
  })).optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(60, "SEO title must be less than 60 characters").optional(),
  seoDescription: z.string().max(160, "SEO description must be less than 160 characters").optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  externalLinks: z.string().optional(),
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
    
    let validatedData;
    try {
      validatedData = createPostSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        )
      }
      throw error
    }

    // Generate slug from title
    let slug = generateSlug(validatedData.title)
    
    // Ensure slug is unique
    const existingPost = await prisma.post.findUnique({ where: { slug } })
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    const postData = {
      title: validatedData.title,
      slug,
      fullText: validatedData.fullText,
      caption: validatedData.caption,
      description: validatedData.description,
      seoTitle: validatedData.seoTitle,
      seoDescription: validatedData.seoDescription,
      status: validatedData.status,
      externalLinks: validatedData.externalLinks,
      publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      authorId: user.id,
      categoryId: validatedData.categoryId,
      images: validatedData.images,
      tags: {
        connect: validatedData.tags?.map(tagId => ({ id: tagId })) || []
      }
    }

    try {
      const post = await prisma.post.create({
        data: postData,
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
    } catch (dbError) {
      throw dbError
    }
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 