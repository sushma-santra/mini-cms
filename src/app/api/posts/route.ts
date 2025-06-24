import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { successResponse, errorResponse, createPagination } from '@/lib/api-response'

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
    isExisting: z.boolean().optional(),
    featured: z.boolean().optional()
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
    isExisting: z.boolean().optional(),
    featured: z.boolean().optional()
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

    const where: any = {}
    
    // Apply role-based filtering
    if (user.role === 'AUTHOR') {
      where.authorId = user.id
    }
    
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    const filters = {
      status,
      search,
      role: user.role
    }

    return successResponse(
      posts,
      'Posts retrieved successfully',
      createPagination(page, limit, total),
      filters
    )
  } catch (error) {
    console.error('Get posts error:', error)
    return errorResponse('Internal server error')
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

    // Prepare post data
    const postData: any = {
      title: validatedData.title,
      slug,
      fullText: validatedData.fullText,
      caption: validatedData.caption,
      description: validatedData.description,
      externalLinks: validatedData.externalLinks,
      seoTitle: validatedData.seoTitle,
      seoDescription: validatedData.seoDescription,
      status: validatedData.status,
      categoryId: validatedData.categoryId,
      publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
      authorId: user.id,
    }

    // Handle images and featured status
    if (validatedData.images && validatedData.images.length > 0) {
      // Enforce only one featured image
      let found = false;
      postData.images = validatedData.images.map(img => {
        if (img.featured && !found) {
          found = true;
          return { ...img, featured: true };
        }
        return { ...img, featured: false };
      });
      // If none were featured, make the first one featured
      if (!found) postData.images[0].featured = true;
    } else {
      postData.images = []
      postData.featuredImage = null
    }

    // Handle tags if provided
    if (validatedData.tags) {
      postData.tags = {
        connect: validatedData.tags.map(tagId => ({ id: tagId }))
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
      // Return consistent response structure
      return NextResponse.json(
        { success: true, message: "Post created successfully", data: post },
        { status: 201 }
      );
    } catch (dbError) {
      throw dbError;
    }
  } catch (error) {
    console.error('Create post error:', error)
    return errorResponse('Internal server error')
  }
} 