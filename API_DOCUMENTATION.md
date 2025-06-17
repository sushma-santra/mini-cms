# Mini CMS API Documentation

## Overview
This document provides comprehensive API documentation for the Mini CMS Tag Manager and related endpoints. All endpoints require authentication via Bearer token in the Authorization header.

## Authentication
All requests must include:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:3000/api
```

---

## Tags Management APIs

### 1. Get All Tags
**GET** `/api/tags`

**Description:** Retrieve all tags with post counts

**Authentication:** Required (Any authenticated user)

**Request:**
```javascript
fetch('/api/tags', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Response:**
```json
{
  "tags": [
    {
      "id": "tag-uuid-1",
      "name": "viratkohli",
      "slug": "viratkohli",
      "description": "Posts related to Virat Kohli",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "_count": {
        "posts": 5
      }
    },
    {
      "id": "tag-uuid-2",
      "name": "WorldCup2024",
      "slug": "worldcup2024",
      "description": "World Cup 2024 coverage",
      "createdAt": "2024-01-10T08:15:00Z",
      "updatedAt": "2024-01-10T08:15:00Z",
      "_count": {
        "posts": 12
      }
    }
  ]
}
```

### 2. Create New Tag
**POST** `/api/tags`

**Description:** Create a new tag

**Authentication:** Admin only

**Request Body:**
```json
{
  "name": "InjuryUpdate",
  "description": "Player injury updates and news"
}
```

**Request:**
```javascript
fetch('/api/tags', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "InjuryUpdate",
    description: "Player injury updates and news"
  })
})
```

**Response (201 Created):**
```json
{
  "id": "tag-uuid-3",
  "name": "InjuryUpdate",
  "slug": "injuryupdate",
  "description": "Player injury updates and news",
  "createdAt": "2024-01-20T14:20:00Z",
  "updatedAt": "2024-01-20T14:20:00Z",
  "_count": {
    "posts": 0
  }
}
```

**Validation Rules:**
- `name`: Required, minimum 1 character
- `description`: Optional string
- Slug is auto-generated from name
- Duplicate slugs get timestamp suffix

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["name"],
      "message": "Name is required"
    }
  ]
}

// 403 Forbidden
{
  "error": "Admin access required"
}
```

### 3. Update Tag
**PUT** `/api/tags/{id}`

**Description:** Update an existing tag

**Authentication:** Admin only

**Request Body:**
```json
{
  "name": "ViratKohliUpdated",
  "description": "Updated description for Virat Kohli posts"
}
```

**Request:**
```javascript
fetch(`/api/tags/${tagId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "ViratKohliUpdated",
    description: "Updated description"
  })
})
```

**Response (200 OK):**
```json
{
  "id": "tag-uuid-1",
  "name": "ViratKohliUpdated",
  "slug": "viratkoliupdated",
  "description": "Updated description for Virat Kohli posts",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z",
  "_count": {
    "posts": 5
  }
}
```

**Validation Rules:**
- Both `name` and `description` are optional
- If name changes, slug is regenerated
- Slug uniqueness is enforced

**Error Responses:**
```json
// 404 Not Found
{
  "error": "Tag not found"
}

// 403 Forbidden
{
  "error": "Admin access required"
}
```

### 4. Delete Tag
**DELETE** `/api/tags/{id}`

**Description:** Delete a tag (only if not used in any posts)

**Authentication:** Admin only

**Request:**
```javascript
fetch(`/api/tags/${tagId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Response (200 OK):**
```json
{
  "message": "Tag deleted successfully"
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "Cannot delete tag with existing posts"
}

// 404 Not Found
{
  "error": "Tag not found"
}

// 403 Forbidden
{
  "error": "Admin access required"
}
```

---

## Posts Management APIs (Updated for Tags)

### 1. Get All Posts
**GET** `/api/posts`

**Description:** Retrieve posts with tag relationships

**Authentication:** Required (Role-based filtering applied)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status ('DRAFT' | 'PUBLISHED')
- `search`: Search in title and content

**Request:**
```javascript
fetch('/api/posts?page=1&limit=10&status=PUBLISHED', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Response:**
```json
{
  "posts": [
    {
      "id": "post-uuid-1",
      "title": "Virat Kohli's Latest Performance",
      "slug": "virat-kohli-latest-performance",
      "content": "Post content...",
      "excerpt": "Auto-generated excerpt...",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-20T10:00:00Z",
      "createdAt": "2024-01-20T09:30:00Z",
      "updatedAt": "2024-01-20T10:00:00Z",
      "author": {
        "id": "user-uuid-1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "category": {
        "id": "category-uuid-1",
        "name": "Sports"
      },
      "tags": [
        {
          "id": "tag-uuid-1",
          "name": "viratkohli",
          "slug": "viratkohli",
          "description": "Posts related to Virat Kohli"
        },
        {
          "id": "tag-uuid-3",
          "name": "InjuryUpdate",
          "slug": "injuryupdate",
          "description": "Player injury updates and news"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 2. Create New Post
**POST** `/api/posts`

**Description:** Create a new post with tags

**Authentication:** Required (Author or Admin)

**Request Body:**
```json
{
  "title": "New Post Title",
  "content": "Post content here...",
  "seoTitle": "SEO optimized title",
  "seoDescription": "SEO description",
  "featuredImage": "https://example.com/image.jpg",
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "aspectRatio": "16:9",
      "baseFilename": "image1.jpg"
    }
  ],
  "status": "DRAFT",
  "categoryId": "category-uuid-1",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

**Request:**
```javascript
fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "New Post Title",
    content: "Post content here...",
    status: "DRAFT",
    categoryId: "category-uuid-1",
    tagIds: ["tag-uuid-1", "tag-uuid-2"]
  })
})
```

**Response (201 Created):**
```json
{
  "id": "post-uuid-new",
  "title": "New Post Title",
  "slug": "new-post-title",
  "content": "Post content here...",
  "excerpt": "Auto-generated excerpt...",
  "status": "DRAFT",
  "publishedAt": null,
  "createdAt": "2024-01-20T16:00:00Z",
  "updatedAt": "2024-01-20T16:00:00Z",
  "author": {
    "id": "user-uuid-1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "category": {
    "id": "category-uuid-1",
    "name": "Sports"
  },
  "tags": [
    {
      "id": "tag-uuid-1",
      "name": "viratkohli",
      "slug": "viratkohli",
      "description": "Posts related to Virat Kohli"
    },
    {
      "id": "tag-uuid-2",
      "name": "WorldCup2024",
      "slug": "worldcup2024",
      "description": "World Cup 2024 coverage"
    }
  ]
}
```

### 3. Update Post
**PUT** `/api/posts/{id}`

**Description:** Update an existing post with tags

**Authentication:** Required (Author of post or Admin)

**Request Body:**
```json
{
  "title": "Updated Post Title",
  "content": "Updated content...",
  "status": "PUBLISHED",
  "tagIds": ["tag-uuid-1", "tag-uuid-3"]
}
```

**Request:**
```javascript
fetch(`/api/posts/${postId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "Updated Post Title",
    content: "Updated content...",
    status: "PUBLISHED",
    tagIds: ["tag-uuid-1", "tag-uuid-3"]
  })
})
```

**Response (200 OK):**
```json
{
  "id": "post-uuid-1",
  "title": "Updated Post Title",
  "slug": "updated-post-title",
  "content": "Updated content...",
  "status": "PUBLISHED",
  "publishedAt": "2024-01-20T16:30:00Z",
  "tags": [
    {
      "id": "tag-uuid-1",
      "name": "viratkohli",
      "slug": "viratkohli",
      "description": "Posts related to Virat Kohli"
    },
    {
      "id": "tag-uuid-3",
      "name": "InjuryUpdate",
      "slug": "injuryupdate",
      "description": "Player injury updates and news"
    }
  ]
}
```

**Tag Update Behavior:**
- `tagIds` array replaces all existing tag relationships
- Empty array `[]` removes all tags
- Omitting `tagIds` keeps existing tags unchanged

### 4. Get Single Post
**GET** `/api/posts/{id}`

**Description:** Retrieve a specific post with all tag details

**Authentication:** Required

**Request:**
```javascript
fetch(`/api/posts/${postId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Response (200 OK):**
```json
{
  "id": "post-uuid-1",
  "title": "Post Title",
  "slug": "post-title",
  "content": "Full post content...",
  "excerpt": "Excerpt...",
  "status": "PUBLISHED",
  "publishedAt": "2024-01-20T10:00:00Z",
  "createdAt": "2024-01-20T09:30:00Z",
  "updatedAt": "2024-01-20T16:30:00Z",
  "author": {
    "id": "user-uuid-1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "category": {
    "id": "category-uuid-1",
    "name": "Sports"
  },
  "tags": [
    {
      "id": "tag-uuid-1",
      "name": "viratkohli",
      "slug": "viratkohli",
      "description": "Posts related to Virat Kohli",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Dashboard API (Updated)

### Get Dashboard Statistics
**GET** `/api/dashboard`

**Description:** Retrieve dashboard statistics including tag count

**Authentication:** Required

**Request:**
```javascript
fetch('/api/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Response:**
```json
{
  "stats": {
    "totalPosts": 25,
    "publishedPosts": 18,
    "draftPosts": 7,
    "totalCategories": 5,
    "totalTags": 12,
    "totalUsers": 3
  },
  "recentPosts": [
    {
      "id": "post-uuid-1",
      "title": "Recent Post",
      "status": "PUBLISHED",
      "updatedAt": "2024-01-20T16:30:00Z",
      "author": {
        "id": "user-uuid-1",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "authorStats": [
    {
      "id": "user-uuid-1",
      "name": "John Doe",
      "role": "ADMIN",
      "_count": {
        "posts": 15
      }
    }
  ],
  "userRole": "ADMIN"
}
```

**Role-Based Response:**
- **Admin users:** Get all statistics including `totalTags`, `totalCategories`, `totalUsers`, and `authorStats`
- **Author users:** Only get post-related statistics, other fields are `null`

---

## Error Handling

### Common HTTP Status Codes
- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid input or validation error
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

### Error Response Format
```json
{
  "error": "Error message",
  "details": [
    {
      "path": ["fieldName"],
      "message": "Specific validation error"
    }
  ]
}
```

---

## Data Models

### Tag Model
```typescript
interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
  _count?: {
    posts: number
  }
}
```

### Post Model (with Tags)
```typescript
interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  seoTitle?: string
  seoDescription?: string
  featuredImage?: string
  images?: Image[]
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  authorId: string
  categoryId?: string
  author: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
  }
  tags: Tag[]
}
```

### Image Model
```typescript
interface Image {
  url: string
  aspectRatio: string
  baseFilename?: string
}
```

---

## Frontend Integration Examples

### React Hook for Tags
```javascript
// Custom hook for managing tags
const useTags = () => {
  const [tags, setTags] = useState([])
  const { token } = useAuth()

  const fetchTags = async () => {
    const response = await fetch('/api/tags', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setTags(data.tags)
  }

  const createTag = async (tagData) => {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tagData)
    })
    return response.json()
  }

  const updateTag = async (id, tagData) => {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tagData)
    })
    return response.json()
  }

  const deleteTag = async (id) => {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  }

  return { tags, fetchTags, createTag, updateTag, deleteTag }
}
```

### Post Creation with Tags
```javascript
const createPost = async (postData) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: postData.title,
      content: postData.content,
      status: postData.status,
      categoryId: postData.categoryId,
      tagIds: postData.selectedTagIds // Array of tag IDs
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to create post')
  }
  
  return response.json()
}
```

---

## Notes for Frontend Developers

1. **Authentication:** All endpoints require Bearer token authentication
2. **Role Permissions:** Tag creation/editing/deletion requires Admin role
3. **Validation:** Input validation is handled server-side with Zod schemas
4. **Slug Generation:** Slugs are auto-generated from names, with uniqueness ensured
5. **Tag Relationships:** Post-tag relationships use Prisma's connect/set operations
6. **Error Handling:** Always check response status and handle errors appropriately
7. **Search Functionality:** Tags can be searched by name and description on frontend
8. **Real-time Updates:** Fetch tags after creation/update to get latest data

This API documentation provides all the endpoints needed for full Tag Manager functionality in the Mini CMS system. 