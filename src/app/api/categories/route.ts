import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { 
            posts: {
              where: { status: 'PUBLISHED' }  // Only count published posts
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    })

    // Transform the data to match what the frontend expects
    const transformedCategories = categories.map(category => ({
      ...category,
      posts: Array(category._count.posts).fill(null)  // Create an array with correct length
    }))

    return successResponse(
      transformedCategories,
      'Categories retrieved successfully'
    )
  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse('Internal server error')
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)
    const body = await request.json()
    
    const data = categorySchema.parse(body)

    // Generate slug from name
    let slug = generateSlug(data.name)
    
    // Ensure slug is unique
    const existingCategory = await prisma.category.findUnique({ where: { slug } })
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    })

    return successResponse(category, 'Category created successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400)
    }

    console.error('Create category error:', error)
    return errorResponse('Internal server error')
  }
} 