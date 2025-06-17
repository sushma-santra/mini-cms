import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/content - Public content API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract parameters
    const cat = searchParams.get('cat') // Category or comma-separated categories
    const id = searchParams.get('id') // Specific content ID
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const totalContent = searchParams.get('totalContent') ? parseInt(searchParams.get('totalContent')!) : null

    // Validate parameters
    if (page < 1) {
      return NextResponse.json({
        success: false,
        error: 'Invalid page number',
        code: 400
      }, { status: 400 })
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        error: 'Limit must be between 1 and 100',
        code: 400
      }, { status: 400 })
    }

    // Handle specific content request
    if (id) {
      if (!cat) {
        return NextResponse.json({
          success: false,
          error: 'Category is required when requesting specific content',
          code: 400
        }, { status: 400 })
      }

      const content = await prisma.post.findFirst({
        where: {
          id,
          status: 'PUBLISHED',
          category: {
            name: {
              in: cat.split(',').map(c => c.trim())
            }
          }
        },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          tags: {
            select: {
              name: true
            }
          }
        }
      })

      if (!content) {
        return NextResponse.json({
          success: false,
          error: 'Content not found',
          code: 404
        }, { status: 404 })
      }

      // Get related content (same category, excluding current)
      const relatedContent = await prisma.post.findMany({
        where: {
          id: { not: id },
          status: 'PUBLISHED',
          categoryId: content.categoryId
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: {
            select: { name: true }
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: 3
      })

      // Format single content response
      const formattedContent = {
        id: content.id,
        title: content.title,
        slug: content.slug,
        content: content.content,
        excerpt: content.excerpt,
        category: content.category?.name || 'uncategorized',
        publishedAt: content.publishedAt?.toISOString(),
        featuredImage: content.featuredImage,
        images: content.images || [],
        author: {
          name: content.author.name,
          bio: content.author.email, // You can modify this based on your user model
          avatar: null // Add avatar field to user model if needed
        },
        tags: content.tags.map(tag => tag.name),
        readTime: calculateReadTime(content.content),
        relatedContent: relatedContent.map(related => ({
          id: related.id,
          title: related.title,
          slug: related.slug,
          category: related.category?.name || 'uncategorized'
        }))
      }

      return NextResponse.json({
        success: true,
        data: formattedContent
      })
    }

    // Build where clause for list queries
    const whereClause: any = {
      status: 'PUBLISHED'
    }

    // Handle category filtering
    if (cat) {
      const categories = cat.split(',').map(c => c.trim())
      whereClause.category = {
        name: {
          in: categories
        }
      }
    }

    // Handle mixed category feed with totalContent
    if (totalContent && cat) {
      const categories = cat.split(',').map(c => c.trim())
      
      if (categories.length > 1) {
        // Mixed category feed
        const content = await prisma.post.findMany({
          where: whereClause,
          include: {
            author: {
              select: {
                name: true,
                email: true
              }
            },
            category: {
              select: {
                name: true
              }
            },
            tags: {
              select: {
                name: true
              }
            }
          },
          orderBy: { publishedAt: 'desc' },
          take: totalContent
        })

        const formattedContent = content.map(formatContentForList)

        return NextResponse.json({
          success: true,
          data: formattedContent,
          filters: {
            categories: categories,
            totalRequested: totalContent
          }
        })
      }
    }

    // Regular list query with pagination
    const skip = (page - 1) * limit

    const [content, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          tags: {
            select: {
              name: true
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where: whereClause })
    ])

    const formattedContent = content.map(formatContentForList)

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: formattedContent,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        category: cat,
        totalRequested: formattedContent.length
      }
    })

  } catch (error) {
    console.error('Public content API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 500
    }, { status: 500 })
  }
}

// Helper function to format content for list responses
function formatContentForList(content: any) {
  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    excerpt: content.excerpt,
    content: content.content,
    category: content.category?.name || 'uncategorized',
    publishedAt: content.publishedAt?.toISOString(),
    featuredImage: content.featuredImage,
    images: content.images || [],
    author: {
      name: content.author.name,
      avatar: null // Add avatar field to user model if needed
    },
    tags: content.tags.map((tag: any) => tag.name),
    readTime: calculateReadTime(content.content)
  }
}

// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min`
} 