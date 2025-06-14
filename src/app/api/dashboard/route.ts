import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const whereClause = user.role === 'ADMIN' ? {} : { authorId: user.id }

    // Get post statistics
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      recentPosts
    ] = await Promise.all([
      prisma.post.count({ where: whereClause }),
      prisma.post.count({ where: { ...whereClause, status: 'PUBLISHED' } }),
      prisma.post.count({ where: { ...whereClause, status: 'DRAFT' } }),
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ])

    // Get admin-only statistics
    let totalCategories = 0
    let totalUsers = 0
    let authorStats: any[] = []
    
    if (user.role === 'ADMIN') {
      const [categories, users, authors] = await Promise.all([
        prisma.category.count(),
        prisma.user.count(),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            role: true,
            _count: {
              select: {
                posts: true,
              },
            },
          },
          orderBy: {
            posts: {
              _count: 'desc',
            },
          },
          take: 5,
        })
      ])
      
      totalCategories = categories
      totalUsers = users
      authorStats = authors
    }

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalCategories: user.role === 'ADMIN' ? totalCategories : null,
        totalUsers: user.role === 'ADMIN' ? totalUsers : null,
      },
      recentPosts,
      authorStats: user.role === 'ADMIN' ? authorStats : null,
      userRole: user.role,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 