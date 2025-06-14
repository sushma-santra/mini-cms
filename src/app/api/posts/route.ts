import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug, generateExcerpt } from '@/lib/utils'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featuredImage: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    aspectRatio: z.string()
  })).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const updatePostSchema = createPostSchema.partial()

// GET /api/posts - Get all posts (role-based filtering)
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    
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
        { content: { contains: search, mode: 'insensitive' } },
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
    const user = requireAuth(request)
    const body = await request.json()
    console.log('Raw request body:', JSON.stringify(body, null, 2))
    
    const data = createPostSchema.parse(body)
    console.log('Parsed data:', JSON.stringify(data, null, 2))

    // Generate slug from title
    let slug = generateSlug(data.title)
    
    // Ensure slug is unique
    const existingPost = await prisma.post.findUnique({ where: { slug } })
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    // Generate excerpt if not provided
    const excerpt = generateExcerpt(data.content)

    const postData: any = {
      title: data.title,
      slug,
      content: data.content,
      excerpt,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      featuredImage: data.featuredImage,
      status: data.status,
      categoryId: data.categoryId,
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      authorId: user.id,
    }

    // Add images if provided
    if (data.images && data.images.length > 0) {
      postData.images = data.images
      console.log('Adding images to postData:', JSON.stringify(data.images, null, 2))
    }

    console.log('Final postData:', JSON.stringify(postData, null, 2))

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