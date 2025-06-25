import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const whereClause = user.role === 'ADMIN' ? {} : { authorId: user.id }

    // Define all data fetching promises
    const promises: any[] = [
      prisma.post.count({ where: whereClause }),
      prisma.post.count({ where: { ...whereClause, status: 'PUBLISHED' } }),
      prisma.post.count({ where: { ...whereClause, status: 'DRAFT' } }),
      prisma.post.findMany({
        where: whereClause,
        include: { author: { select: { id: true, name: true, email: true } }, category: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.customerStory.count({ where: whereClause }),
      prisma.customerStory.count({ where: { ...whereClause, status: 'PUBLISHED' } }),
      prisma.customerStory.count({ where: { ...whereClause, status: 'DRAFT' } }),
      prisma.event.count({ where: whereClause }),
      prisma.event.count({ where: { ...whereClause, status: 'PUBLISHED' } }),
      prisma.event.count({ where: { ...whereClause, status: 'DRAFT' } }),
      prisma.event.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          start_date: true,
          end_date: true,
          status: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ start_date: 'asc' }, { updatedAt: 'desc' }],
        take: 5,
      }),
    ]

    if (user.role === 'ADMIN') {
      promises.push(
        prisma.category.count(),
        prisma.tag.count(),
        prisma.user.count(),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            role: true,
            _count: {
              select: {
                posts: true,
                customerStories: true,
                events: true,
              },
            },
          },
          orderBy: { posts: { _count: 'desc' } },
          take: 5,
        })
      )
    }

    const results = await Promise.all(promises)

    // Destructure results
    let resultIndex = 0
    const totalPosts = results[resultIndex++]
    const publishedPosts = results[resultIndex++]
    const draftPosts = results[resultIndex++]
    const recentPosts = results[resultIndex++]
    const totalCustomerStories = results[resultIndex++]
    const publishedCustomerStories = results[resultIndex++]
    const draftCustomerStories = results[resultIndex++]
    const totalEvents = results[resultIndex++]
    const publishedEvents = results[resultIndex++]
    const draftEvents = results[resultIndex++]
    const recentEvents = results[resultIndex++]

    let totalCategories = 0,
      totalTags = 0,
      totalUsers = 0,
      authorStats: any[] = []

    if (user.role === 'ADMIN') {
      totalCategories = results[resultIndex++]
      totalTags = results[resultIndex++]
      totalUsers = results[resultIndex++]
      authorStats = results[resultIndex++]
    }

    return NextResponse.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalCustomerStories,
        publishedCustomerStories,
        draftCustomerStories,
        totalEvents,
        publishedEvents,
        draftEvents,
        totalCategories: user.role === 'ADMIN' ? totalCategories : 0,
        totalTags: user.role === 'ADMIN' ? totalTags : 0,
        totalUsers: user.role === 'ADMIN' ? totalUsers : 0,
      },
      recentPosts,
      recentEvents,
      authorStats: user.role === 'ADMIN' ? authorStats : [],
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