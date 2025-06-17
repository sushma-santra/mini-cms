import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description } = tagSchema.parse(body)

    // Generate slug from name
    let slug = generateSlug(name)
    
    // Ensure slug is unique
    const existingTag = await prisma.tag.findUnique({ where: { slug } })
    if (existingTag) {
      slug = `${slug}-${Date.now()}`
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        _count: {
          select: { posts: true }
        }
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create tag error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 