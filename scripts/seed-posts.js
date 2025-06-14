const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create a test author if not exists
  const author = await prisma.user.upsert({
    where: { email: 'author@example.com' },
    update: {},
    create: {
      email: 'author@example.com',
      name: 'Test Author',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpR1IOBYVxGqHy', // password: test123
      role: 'AUTHOR',
    },
  })

  // Create some sample posts
  const posts = [
    {
      title: 'Getting Started with Next.js',
      content: `
        <h2>Introduction to Next.js</h2>
        <p>Next.js is a powerful React framework that enables server-side rendering and static site generation.</p>
        <h3>Key Features</h3>
        <ul>
          <li>Server-side rendering</li>
          <li>Static site generation</li>
          <li>API routes</li>
          <li>File-based routing</li>
        </ul>
      `,
      status: 'PUBLISHED',
      featuredImage: '/uploads/sample-1.jpg',
      images: [
        {
          url: '/uploads/sample-1.jpg',
          aspectRatio: 'landscape'
        },
        {
          url: '/uploads/sample-2.jpg',
          aspectRatio: 'portrait'
        }
      ],
      seoTitle: 'Learn Next.js - A Complete Guide for Beginners',
      seoDescription: 'Master Next.js with our comprehensive guide. Learn server-side rendering, static generation, and more.',
    },
    {
      title: 'Building a Blog with Prisma',
      content: `
        <h2>Prisma ORM Tutorial</h2>
        <p>Learn how to build a modern blog using Prisma ORM and PostgreSQL.</p>
        <h3>What You'll Learn</h3>
        <ul>
          <li>Setting up Prisma</li>
          <li>Database schema design</li>
          <li>CRUD operations</li>
          <li>Relationships and queries</li>
        </ul>
      `,
      status: 'PUBLISHED',
      featuredImage: '/uploads/sample-3.jpg',
      images: [
        {
          url: '/uploads/sample-3.jpg',
          aspectRatio: 'square'
        },
        {
          url: '/uploads/sample-4.jpg',
          aspectRatio: 'wide'
        }
      ],
      seoTitle: 'Build a Blog with Prisma ORM - Step by Step Guide',
      seoDescription: 'Create a full-featured blog using Prisma ORM. Learn database design, relationships, and advanced queries.',
    },
    {
      title: 'Mastering TypeScript',
      content: `
        <h2>TypeScript Deep Dive</h2>
        <p>Take your TypeScript skills to the next level with advanced concepts and best practices.</p>
        <h3>Topics Covered</h3>
        <ul>
          <li>Advanced types</li>
          <li>Generics</li>
          <li>Decorators</li>
          <li>Type inference</li>
        </ul>
      `,
      status: 'DRAFT',
      featuredImage: '/uploads/sample-5.jpg',
      images: [
        {
          url: '/uploads/sample-5.jpg',
          aspectRatio: 'standard'
        },
        {
          url: '/uploads/sample-6.jpg',
          aspectRatio: 'free'
        }
      ],
      seoTitle: 'Advanced TypeScript Tutorial - From Basics to Mastery',
      seoDescription: 'Master TypeScript with our comprehensive guide. Learn advanced types, generics, and best practices.',
    }
  ]

  for (const post of posts) {
    await prisma.post.create({
      data: {
        ...post,
        authorId: author.id,
        slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: post.content.replace(/<[^>]*>/g, '').substring(0, 200),
        publishedAt: post.status === 'PUBLISHED' ? new Date() : null,
      },
    })
  }

  console.log('Sample posts created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 