import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const updateTagSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
})

// PUT /api/tags/[id] - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateTagSchema.parse(body)

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = { ...data }

    // Generate new slug if name changed
    if (data.name && data.name !== existingTag.name) {
      let slug = generateSlug(data.name)
      
      // Ensure slug is unique (exclude current tag)
      const slugExists = await prisma.tag.findFirst({
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

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { posts: true }
        }
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update tag error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request)
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { posts: true }
        }
      },
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Check if tag has posts
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tag with existing posts' },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    console.error('Delete tag error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 