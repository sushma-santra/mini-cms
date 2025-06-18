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
| `slug` | string | Specific content slug | `my-blog-post-title` |
| `page` | number | Page number (default: 1) | `1`, `2`, `3` |
| `limit` | number | Items per page (default: 20) | `5`, `10`, `20` |
| `totalContent` | number | Total items for mixed feeds | `5`, `10` |
| `relatedcontent` | boolean | Include related content based on shared tags | `true`, `false` |

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

### 3. Get Specific Content by Slug
```javascript
GET /api/content?cat=blogs&slug=my-blog-post-title
GET /api/content?cat=media&slug=my-media-item
GET /api/content?cat=case-studies&slug=australia-star-smashes-record-equalling-13-sixes-in-backs-to-wall-mlc-century-from-no6
```

### 4. Get Content with Related Content (Tag-based)
```javascript
GET /api/content?cat=blogs&slug=my-blog-post-title&relatedcontent=true
GET /api/content?cat=blogs&slug=my-blog-post-title&relatedcontent=true&limit=5
GET /api/content?cat=case-studies&slug=my-case-study&relatedcontent=true&limit=3
```

### 5. Mixed Category Feed
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
      "id": "cmc1qheaw0001af861yc8csy6",
      "title": "Australia star smashes record-equalling 13 sixes in backs-to-wall MLC century from No.6",
      "slug": "australia-star-smashes-record-equalling-13-sixes-in-backs-to-wall-mlc-century-from-no6",
      "excerpt": "&lt;h2&gt;Glenn Maxwell rescues Washington Freedom with century from No.6&lt;/h2&gt;\\r\\n&lt;p&gt;In the eighth game of the 2025 season at the Oakland Coliseum,...",
      "fullText": "<p><span style=\"color: rgb(11, 117, 0);\">&lt;h2&gt;Glenn Maxwell rescues Washington Freedom with century from No.6&lt;/h2&gt;\\r\\n&lt;p&gt;In the eighth game of the 2025 season at the Oakland Coliseum, Washington skipper Maxwell elected to bat first against the LA Knight Riders...</span></p>",
      "caption": "Australia all-rounder Glenn Maxwell scored a stunning century for the Washington Freedom in Major League Cricket on June 17. Read more here.",
      "description": "<p>Australia all-rounder Glenn Maxwell scored a stunning century for the Washington Freedom in Major League Cricket on June 17. Read more here.</p>",
      "externalLinks": "https://www.wisden.com/series/major-league-cricket-2025/cricket-news/australia-star-glenn-maxwell-smashes-13-sixes-in-backs-to-wall-mlc-century-from-no6",
      "category": "case-studies",
      "publishedAt": "2025-06-18T09:12:26.020Z",
      "featuredImage": "/uploads/images/1-1/1750237908193-vxovt03wuze.jpg",
      "images": [
        {
          "url": "/uploads/images/1-1/1750237908193-vxovt03wuze.jpg",
          "aspectRatio": "1-1",
          "baseFilename": "1750237908193-vxovt03wuze.jpg"
        }
      ],
      "author": {
        "name": "Admin User",
        "avatar": null
      },
      "tags": ["icc rankings"],
      "readTime": "4 min"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1,
    "total": 2,
    "pages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "category": "case-studies",
    "totalRequested": 1
  }
}
```

### Single Content Response
```json
{
  "success": true,
  "data": {
    "id": "cmc1qheaw0001af861yc8csy6",
    "title": "Australia star smashes record-equalling 13 sixes in backs-to-wall MLC century from No.6",
    "slug": "australia-star-smashes-record-equalling-13-sixes-in-backs-to-wall-mlc-century-from-no6",
    "fullText": "<p><span style=\"color: rgb(11, 117, 0);\">&lt;h2&gt;Glenn Maxwell rescues Washington Freedom with century from No.6&lt;/h2&gt;\\r\\n&lt;p&gt;In the eighth game of the 2025 season at the Oakland Coliseum, Washington skipper Maxwell elected to bat first against the LA Knight Riders. Openers Mitchell Owen and Rachin Ravindra were dismissed in the first three overs...</span></p>",
    "excerpt": "&lt;h2&gt;Glenn Maxwell rescues Washington Freedom with century from No.6&lt;/h2&gt;\\r\\n&lt;p&gt;In the eighth game of the 2025 season at the Oakland Coliseum,...",
    "caption": "Australia all-rounder Glenn Maxwell scored a stunning century for the Washington Freedom in Major League Cricket on June 17. Read more here.",
    "description": "<p>Australia all-rounder Glenn Maxwell scored a stunning century for the Washington Freedom in Major League Cricket on June 17. Read more here.</p>",
    "externalLinks": "https://www.wisden.com/series/major-league-cricket-2025/cricket-news/australia-star-glenn-maxwell-smashes-13-sixes-in-backs-to-wall-mlc-century-from-no6",
    "category": "case-studies",
    "publishedAt": "2025-06-18T09:12:26.020Z",
    "featuredImage": "/uploads/images/1-1/1750237908193-vxovt03wuze.jpg",
    "images": [
      {
        "url": "/uploads/images/1-1/1750237908193-vxovt03wuze.jpg",
        "aspectRatio": "1-1",
        "baseFilename": "1750237908193-vxovt03wuze.jpg"
      }
    ],
    "author": {
      "name": "Admin User",
      "bio": "admin@example.com",
      "avatar": null
    },
    "tags": ["icc rankings"],
    "readTime": "4 min",
    "taggedContent": [
      {
        "id": "tagged-1",
        "title": "Recent Post in Same Category",
        "slug": "recent-post-slug",
        "category": "case-studies"
      }
    ],
    "relatedContent": [
      {
        "id": "related-1",
        "title": "Post with Shared Tags",
        "slug": "post-with-shared-tags",
        "fullText": "<p>Content with similar tags...</p>",
        "excerpt": "Brief excerpt...",
        "caption": "Caption for related content",
        "description": "<p>Description of related content</p>",
        "externalLinks": "https://example.com",
        "category": "case-studies",
        "publishedAt": "2025-06-17T09:12:26.020Z",
        "featuredImage": "/uploads/images/related.jpg",
        "images": [],
        "author": {
          "name": "Admin User",
          "avatar": null
        },
        "tags": ["icc rankings", "cricket"],
        "readTime": "3 min"
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

// Get specific content by slug
const fetchSingleContent = async (category, slug) => {
  const response = await fetch(`/api/content?cat=${category}&slug=${slug}`)
  const data = await response.json()
  return data.data
}

// Get content with related posts based on shared tags
const fetchContentWithRelated = async (category, slug, limit = 5) => {
  const response = await fetch(`/api/content?cat=${category}&slug=${slug}&relatedcontent=true&limit=${limit}`)
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

// Blog post detail page with related content
async function loadBlogPostWithRelated(slug) {
  try {
    const response = await fetch(`/api/content?cat=blogs&slug=${slug}&relatedcontent=true&limit=3`)
    const result = await response.json()
    
    if (result.success) {
      displayBlogPost(result.data)
      displayTaggedContent(result.data.taggedContent) // Recent posts from same category
      displayRelatedContent(result.data.relatedContent) // Posts with shared tags
    }
  } catch (error) {
    console.error('Failed to load blog post:', error)
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

### 🔗 **Related Content Feature**
- **`taggedContent`**: Always present in single content responses - recent posts from same category
- **`relatedContent`**: Only present when `relatedcontent=true` - posts sharing tags with current post
- Related content is filtered by same category and excludes the current post
- Use `limit` parameter to control how many related items to return (default: based on API limit)

### 🔢 **Data Ordering**
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
6. **Use `relatedcontent=true`** for showing tag-based related posts

## Quick Reference

| Task | API Call |
|------|----------|
| Homepage highlights | `/api/content?cat=blogs,media&totalContent=6` |
| Blogs page | `/api/content?cat=blogs&page=1&limit=12` |
| Media gallery | `/api/content?cat=media&page=1&limit=20` |
| Case studies page | `/api/content?cat=case-studies&page=1&limit=10` |
| Single blog post | `/api/content?cat=blogs&slug=my-blog-post-slug` |
| Blog post with related | `/api/content?cat=blogs&slug=my-blog-post-slug&relatedcontent=true&limit=5` |
| Single media item | `/api/content?cat=media&slug=my-media-slug` |
| Single case study | `/api/content?cat=case-studies&slug=my-case-study-slug` |
| Case study with related | `/api/content?cat=case-studies&slug=my-case-study-slug&relatedcontent=true&limit=3` |
| All categories | `/api/content?cat=blogs,media,case-studies&page=1` |

## Parameter Combinations

### Valid Combinations
```javascript
// ✅ Category only
/api/content?cat=blogs

// ✅ Category + pagination
/api/content?cat=blogs&page=2&limit=15

// ✅ Specific content by slug
/api/content?cat=blogs&slug=my-blog-post-slug

// ✅ Specific content with related content
/api/content?cat=blogs&slug=my-blog-post-slug&relatedcontent=true&limit=5

// ✅ Multiple categories
/api/content?cat=blogs,media&totalContent=10
```

### Invalid Combinations
```javascript
// ❌ Slug without category
/api/content?slug=my-blog-post-slug

// ❌ totalContent with single category (use limit instead)
/api/content?cat=blogs&totalContent=5

// ❌ page with totalContent (totalContent ignores pagination)
/api/content?cat=blogs,media&totalContent=5&page=2

// ❌ relatedcontent without slug (related content only works for single content)
/api/content?cat=blogs&relatedcontent=true
```

## Response Data Fields

### Content Object Fields
| Field | Type | Description | Always Present |
|-------|------|-------------|----------------|
| `id` | string | Unique content identifier | ✅ |
| `title` | string | Content title | ✅ |
| `slug` | string | URL-friendly identifier | ✅ |
| `excerpt` | string | Brief description (auto-generated from fullText) | ✅ |
| `fullText` | string | Full content body (rich HTML from editor) | ✅ |
| `caption` | string | Short caption for the content | ❌ |
| `description` | string | Rich HTML description (from visual editor) | ❌ |
| `externalLinks` | string | External reference links | ❌ |
| `category` | string | Content category | ✅ |
| `publishedAt` | string | Publication date (ISO format) | ✅ |
| `featuredImage` | string | Main image URL | ❌ |
| `images` | array | Additional images with aspect ratios | ❌ |
| `author` | object | Author information | ✅ |
| `tags` | array | Content tags | ❌ |
| `readTime` | string | Estimated read time | ✅ |
| `taggedContent` | array | Recent content from same category (single content only) | ✅ (single) |
| `relatedContent` | array | Tag-based related content (single content only, when requested) | ❌ |

### Pagination Object Fields
| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total items available |
| `pages` | number | Total pages available |
| `hasNext` | boolean | Has next page |
| `hasPrev` | boolean | Has previous page |

### Related Content Logic
- **`taggedContent`**: Recent posts from the same category (always included in single content responses)
- **`relatedContent`**: Posts that share at least one tag with the current post (only when `relatedcontent=true`)
- Both exclude the current post from results
- Results are ordered by `publishedAt` (most recent first)

This documentation provides everything your frontend team needs to start consuming the public content API! 🚀 