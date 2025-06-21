import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/content - Public content API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract parameters
    const cat = searchParams.get('cat') // Category or comma-separated categories
    const slug = searchParams.get('slug')  // Changed from 'id' to 'slug'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const totalContent = searchParams.get('totalContent') ? parseInt(searchParams.get('totalContent')!) : null
    const relatedContent = searchParams.has('relatedcontent')  // Changed to check for parameter existence

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

    // Handle specific content request by slug
    if (slug) {
      // Build where clause for slug query
      const whereClause: any = {
        slug,
        status: 'PUBLISHED'
      }

      // Add category filter if provided (for backward compatibility)
      if (cat) {
        whereClause.category = {
          name: {
            in: cat.split(',').map(c => c.trim())
          }
        }
      }

      const content = await prisma.post.findFirst({
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
      const moreContent = await prisma.post.findMany({
        where: {
          slug: { not: slug },  // Changed from 'id' to 'slug'
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

      // Get related content if requested
      let relatedContentData = null
      if (relatedContent) {
        // Get the current post's tag names for matching
        const currentPostTagNames = content.tags.map(tag => tag.name)
        
        if (currentPostTagNames.length > 0) {
          relatedContentData = await prisma.post.findMany({
            where: {
              slug: { not: slug },  // Exclude current post
              status: 'PUBLISHED',
              categoryId: content.categoryId,  // Same category only
              tags: {
                some: {
                  name: {
                    in: currentPostTagNames  // Posts that have any of the same tags as current post
                  }
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
            },
            orderBy: { publishedAt: 'desc' },  // Most recent first
            take: limit
          })
        }
      }

      // Format single content response
      const contentWithNewFields = content as any  // Type assertion for new fields
      const formattedContent = {
        id: content.id,
        title: content.title,
        slug: content.slug,
        fullText: (content as any).fullText,  // Include fullText for single content requests
        caption: contentWithNewFields.caption || null,  // New field
        description: contentWithNewFields.description || null,  // New field
        externalLinks: contentWithNewFields.externalLinks || null,  // New field
        category: content.category?.name || 'uncategorized',
        publishedAt: content.publishedAt?.toISOString(),
        images: content.images || [],
        author: {
          name: content.author.name,
          bio: content.author.email,
          avatar: null
        },
        tags: content.tags.map(tag => tag.name),
        readTime: calculateReadTime((content as any).fullText),
        taggedContent: moreContent.map(related => ({
          id: related.id,
          title: related.title,
          slug: related.slug,
          category: related.category?.name || 'uncategorized'
        })),
        ...(relatedContent && { relatedContent: relatedContentData?.map(formatContentForListWithoutFullText) || [] })
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

        const formattedContent = content.map(formatContentForListWithoutFullText)

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

    const formattedContent = content.map(formatContentForListWithoutFullText)

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

// Helper function to format content for list responses without fullText
function formatContentForListWithoutFullText(content: any) {
  const contentWithNewFields = content as any  // Type assertion for new fields
  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    caption: contentWithNewFields.caption || null,  // New field
    description: contentWithNewFields.description || null,  // New field
    externalLinks: contentWithNewFields.externalLinks || null,  // New field
    category: content.category?.name || 'uncategorized',
    publishedAt: content.publishedAt?.toISOString(),
    images: content.images || [],
    author: {
      name: content.author.name,
      avatar: null
    },
    tags: content.tags.map((tag: any) => tag.name),
    readTime: calculateReadTime((content as any).fullText)
  }
}

// Helper function to format content for list responses (with fullText - kept for backward compatibility)
function formatContentForList(content: any) {
  const contentWithNewFields = content as any  // Type assertion for new fields
  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    fullText: (content as any).fullText,
    caption: contentWithNewFields.caption || null,  // New field
    description: contentWithNewFields.description || null,  // New field
    externalLinks: contentWithNewFields.externalLinks || null,  // New field
    category: content.category?.name || 'uncategorized',
    publishedAt: content.publishedAt?.toISOString(),
    images: content.images || [],
    author: {
      name: content.author.name,
      avatar: null
    },
    tags: content.tags.map((tag: any) => tag.name),
    readTime: calculateReadTime((content as any).fullText)
  }
}

// Helper function to calculate read time
function calculateReadTime(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') {
    return '1 min'  // Default for empty content
  }
  
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  return `${minutes} min`
} 