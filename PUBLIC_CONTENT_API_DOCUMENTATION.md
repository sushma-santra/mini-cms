# Public Content API Documentation

## Overview
Single endpoint for all content operations. No authentication required.

## Base Endpoint
```
GET /api/content
```

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `cat` | string | Category filter | `blogs`, `media`, `case-studies` |
| `cat` | string | Multiple categories (comma-separated) | `blogs,media` |
| `id` | string | Specific content ID | `content-uuid-123` |
| `page` | number | Page number (default: 1) | `1`, `2`, `3` |
| `limit` | number | Items per page (default: 20) | `5`, `10`, `20` |
| `totalContent` | number | Total items for mixed feeds | `5`, `10` |

## Use Cases & Examples

### 1. List All Content
```javascript
GET /api/content
GET /api/content?page=1&limit=20
```

### 2. List Content by Category
```javascript
GET /api/content?cat=blogs
GET /api/content?cat=media&page=2&limit=5
GET /api/content?cat=case-studies
```

### 3. Get Specific Content
```javascript
GET /api/content?cat=blogs&id=content-uuid-123
GET /api/content?cat=media&id=content-uuid-456
```

### 4. Mixed Category Feed
```javascript
GET /api/content?cat=blogs,media&totalContent=5
GET /api/content?cat=blogs,case-studies&totalContent=8
```

## Response Format

### List Response
```json
{
  "success": true,
  "data": [
    {
      "id": "content-uuid-123",
      "title": "Latest Blog Post",
      "slug": "latest-blog-post",
      "excerpt": "Brief description of the post...",
      "content": "Full content here...",
      "category": "blogs",
      "publishedAt": "2024-01-20T10:00:00Z",
      "featuredImage": "https://example.com/image.jpg",
      "images": [
        {
          "url": "https://example.com/img1.jpg",
          "aspectRatio": "16:9"
        }
      ],
      "author": {
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "tags": ["sports", "news"],
      "readTime": "5 min"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "category": "blogs",
    "totalRequested": 20
  }
}
```

### Single Content Response
```json
{
  "success": true,
  "data": {
    "id": "content-uuid-123",
    "title": "Specific Content Title",
    "slug": "specific-content-title",
    "content": "Full detailed content...",
    "category": "blogs",
    "publishedAt": "2024-01-20T10:00:00Z",
    "featuredImage": "https://example.com/image.jpg",
    "images": [
      {
        "url": "https://example.com/img1.jpg",
        "aspectRatio": "16:9"
      }
    ],
    "author": {
      "name": "John Doe",
      "bio": "Content creator",
      "avatar": "https://example.com/avatar.jpg"
    },
    "tags": ["sports", "news"],
    "readTime": "5 min",
    "relatedContent": [
      {
        "id": "related-1",
        "title": "Related Post",
        "category": "blogs"
      }
    ]
  }
}
```

### Empty Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0,
    "hasNext": false,
    "hasPrev": false
  },
  "message": "No content found"
}
```

## Frontend Implementation Examples

### React Usage
```javascript
// List content
const fetchContent = async (category, page = 1) => {
  const response = await fetch(`/api/content?cat=${category}&page=${page}&limit=20`)
  const data = await response.json()
  return data
}

// Get specific content
const fetchSingleContent = async (category, id) => {
  const response = await fetch(`/api/content?cat=${category}&id=${id}`)
  const data = await response.json()
  return data.data
}

// Mixed feed for homepage
const fetchHighlights = async () => {
  const response = await fetch('/api/content?cat=blogs,media,case-studies&totalContent=6')
  const data = await response.json()
  return data.data
}
```

### JavaScript/Fetch Examples
```javascript
// Blogs page with pagination
async function loadBlogsPage(pageNumber = 1) {
  try {
    const response = await fetch(`/api/content?cat=blogs&page=${pageNumber}&limit=12`)
    const result = await response.json()
    
    if (result.success) {
      displayBlogs(result.data)
      updatePagination(result.pagination)
    }
  } catch (error) {
    console.error('Failed to load blogs:', error)
  }
}

// Homepage highlights component
async function loadHomepageHighlights() {
  const response = await fetch('/api/content?cat=blogs,media,case-studies&totalContent=6')
  const result = await response.json()
  return result.data
}
```

## Important Notes for Frontend Team

### 🔓 **No Authentication Required**
- No Bearer token needed
- Direct API calls from frontend
- No CORS issues (public endpoints)

### 📄 **Pagination Handling**
- Always check `pagination.hasNext` for infinite scroll
- Use `pagination.total` for showing total count
- Default: 20 items per page

### �� **Data Ordering**
- Content is **always sorted by latest publishedAt first**
- No need to handle sorting on frontend
- Most recent content appears at top

### 📱 **Response Consistency**
- Always returns `success: true/false`
- Single content: `data` is object
- Multiple content: `data` is array
- Empty results: `data` is empty array

### 🔍 **Error Handling**
```json
{
  "success": false,
  "error": "Content not found",
  "code": 404
}
```

```javascript
// Error handling example
async function safeApiCall(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'API call failed')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    return { success: false, error: error.message }
  }
}
```

### 💡 **Best Practices**
1. **Cache responses** on frontend for better performance
2. **Use pagination** to avoid large payloads
3. **Handle empty states** gracefully
4. **Combine parameters** for complex queries
5. **Use `totalContent`** for homepage highlights

## Quick Reference

| Task | API Call |
|------|----------|
| Homepage highlights | `/api/content?cat=blogs,media&totalContent=6` |
| Blogs page | `/api/content?cat=blogs&page=1&limit=12` |
| Media gallery | `/api/content?cat=media&page=1&limit=20` |
| Case studies page | `/api/content?cat=case-studies&page=1&limit=10` |
| Single blog post | `/api/content?cat=blogs&id=post-123` |
| Single media item | `/api/content?cat=media&id=media-456` |
| All categories | `/api/content?cat=blogs,media,case-studies&page=1` |

## Parameter Combinations

### Valid Combinations
```javascript
// ✅ Category only
/api/content?cat=blogs

// ✅ Category + pagination
/api/content?cat=blogs&page=2&limit=15

// ✅ Specific content
/api/content?cat=blogs&id=content-123

// ✅ Multiple categories
/api/content?cat=blogs,media&totalContent=10
```

### Invalid Combinations
```javascript
// ❌ ID without category
/api/content?id=content-123

// ❌ totalContent with single category (use limit instead)
/api/content?cat=blogs&totalContent=5

// ❌ page with totalContent (totalContent ignores pagination)
/api/content?cat=blogs,media&totalContent=5&page=2
```

## Response Data Fields

### Content Object Fields
| Field | Type | Description | Always Present |
|-------|------|-------------|----------------|
| `id` | string | Unique content identifier | ✅ |
| `title` | string | Content title | ✅ |
| `slug` | string | URL-friendly identifier | ✅ |
| `excerpt` | string | Brief description | ✅ |
| `content` | string | Full content body | ✅ |
| `category` | string | Content category | ✅ |
| `publishedAt` | string | Publication date (ISO) | ✅ |
| `featuredImage` | string | Main image URL | ❌ |
| `images` | array | Additional images | ❌ |
| `author` | object | Author information | ✅ |
| `tags` | array | Content tags | ❌ |
| `readTime` | string | Estimated read time | ❌ |
| `relatedContent` | array | Related content (single content only) | ❌ |

### Pagination Object Fields
| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total items available |
| `pages` | number | Total pages available |
| `hasNext` | boolean | Has next page |
| `hasPrev` | boolean | Has previous page |

This documentation provides everything your frontend team needs to start consuming the public content API! 🚀 