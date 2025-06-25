# Customer Stories API Documentation

## Base URL
```
http://localhost:3000/api/customerstories
```

## Authentication
- **List endpoints**: Public (no authentication required)
- **Single story endpoints**: Requires authentication
- **Create/Update/Delete**: Requires admin authentication

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customerstories` | Get all customer stories with optional filtering |
| GET | `/api/customerstories?slug={slug}` | Get single story by slug |
| GET | `/api/customerstories/{id}` | Get single story by ID (auth required) |
| POST | `/api/customerstories` | Create new story (auth required) |
| PUT | `/api/customerstories/{id}` | Update story (auth required) |
| DELETE | `/api/customerstories/{id}` | Delete story (auth required) |

---

## 1. Get All Customer Stories

### Endpoint
```http
GET /api/customerstories
```

### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 10, max: 50) | `?limit=5` |
| `industry` | string | Filter by industry | `?industry=TEAM` |
| `solutions` | string | Filter by solution (can be multiple) | `?solutions=DIGITAL_PLATFORMS` |
| `slug` | string | Get single story by slug | `?slug=story-slug` |

### Available Industry Values
```
LEAGUES_AND_FEDERATIONS, TEAM, BROADCASTERS_AND_OTT_PLATFORMS, PUBLISHERS, GAMING_OPERATORS
```

### Available Solution Values
```
GAMING_AND_FAN_LOYALTY, DIGITAL_PLATFORMS, VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION, 
FAN_DATA_AND_CRM_CONSULTING, MARKETING_AND_COMMUNITY_MANAGEMENT, DESIGN_AND_VIDEO_PRODUCTION, 
SPORTS_DATA_SOLUTIONS
```

### Example Request
```http
GET /api/customerstories?limit=2
```

### Example Response
```json
{
  "customerStories": [
    {
      "id": "cmc3385mx0001g6dityipqiko",
      "title": "MI Head Coach, Mahela Jayawardene, analyses our campaign",
      "slug": "mi-head-coach-mahela-jayawardene-analyses-our-campaign",
      "date": "2025-06-19T00:00:00.000Z",
      "caption": "Contributors",
      "description": "In the post-match press conference, our Head Coach Mahela Jayawardene appeared to share his thoughts on the match-up against PBKS and if rain had a say on the outcome of the fixture",
      "seoTitle": null,
      "seoDescription": null,
      "status": "PUBLISHED",
      "publishedAt": "2025-06-19T09:17:13.905Z",
      "createdAt": "2025-06-19T07:56:56.073Z",
      "updatedAt": "2025-06-19T09:17:13.907Z",
      "mediaGallery": [],
      "externalLink": null,
      "industry": "LEAGUES_AND_FEDERATIONS",
      "solutions": [
        "GAMING_AND_FAN_LOYALTY",
        "DIGITAL_PLATFORMS", 
        "FAN_DATA_AND_CRM_CONSULTING"
      ],
      "author": {
        "id": "cmc05x6h00000vha1u4cqf08r",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    },
    {
      "id": "cmc34d5bo0005c1kf535ghaz7",
      "title": "Fan Engagement Revolution",
      "slug": "fan-engagement-revolution",
      "date": "2025-06-19T00:00:00.000Z",
      "caption": "",
      "description": "Creating immersive fan experiences through digital platforms",
      "seoTitle": null,
      "seoDescription": null,
      "status": "PUBLISHED",
      "publishedAt": "2025-06-19T09:10:24.761Z",
      "createdAt": "2025-06-19T08:28:48.564Z",
      "updatedAt": "2025-06-19T09:10:24.763Z",
      "mediaGallery": [],
      "externalLink": null,
      "industry": "TEAM",
      "solutions": [
        "VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION",
        "GAMING_OPERATORS"
      ],
      "author": {
        "id": "cmc05x6h00000vha1u4cqf08r",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 7,
    "pages": 4
  }
}
```

---

## 2. Get Single Customer Story by Slug

### Endpoint
```http
GET /api/customerstories?slug={slug}
```

### Example Request
```http
GET /api/customerstories?slug=mi-head-coach-mahela-jayawardene-analyses-our-campaign
```

### Example Response
```json
{
  "id": "cmc3385mx0001g6dityipqiko",
  "title": "MI Head Coach, Mahela Jayawardene, analyses our campaign",
  "slug": "mi-head-coach-mahela-jayawardene-analyses-our-campaign",
  "date": "2025-06-19T00:00:00.000Z",
  "caption": "Contributors",
  "description": "In the post-match press conference, our Head Coach Mahela Jayawardene appeared to share his thoughts on the match-up against PBKS and if rain had a say on the outcome of the fixture",
  "mediaGallery": [],
  "stats": [
    {
      "label": "Growth in enterprise value",
      "value": "40%"
    },
    {
      "label": "Engagement growth", 
      "value": "470%"
    },
    {
      "label": "First Party Fans",
      "value": "2Mn+"
    },
    {
      "label": "User Retention",
      "value": "4%"
    }
  ],
  "contentSections": [
    {
      "title": "Opportunity",
      "description": "<p>Paltan, a heartbreaking defeat against PBKS to conclude our campaign… But what a stellar season it has been for us. Making a comeback after just one win in four games and making it to Qualifier 2 is, by no means, an easy feat.</p>"
    },
    {
      "title": "The Solution",
      "description": "<p>There was a quiet sense of vindication in that performance. For years, Krunal has been seen as the \"other\" Pandya - the older one, the steadier one, the one who didn't light up games or dominate headlines but somehow always turned up when it mattered.</p>"
    },
    {
      "title": "The Result", 
      "description": "<p>NEW DELHI: A senior police officer had raised red flags over the lack of security personnel and potential crowd control issues just hours before a stampede killed 11 people outside the M Chinnaswamy Stadium.</p>"
    }
  ],
  "seoTitle": null,
  "seoDescription": null,
  "status": "PUBLISHED",
  "publishedAt": "2025-06-19T09:17:13.905Z",
  "createdAt": "2025-06-19T07:56:56.073Z",
  "updatedAt": "2025-06-19T09:17:13.907Z",
  "authorId": "cmc05x6h00000vha1u4cqf08r",
  "externalLink": null,
  "industry": "MANAGEMENT",
  "solutions": [
    "TEAM",
    "PUBLISHERS",
    "FAN_DATA_AND_CRM_CONSULTING"
  ],
  "author": {
    "id": "cmc05x6h00000vha1u4cqf08r",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

**Note**: When fetching by slug, the response includes `stats` and `contentSections` data, which are not included in list responses for performance.

---

## 3. Filter by Industry

### Endpoint
```http
GET /api/customerstories?industry={industry}
```

### Example Request
```http
GET /api/customerstories?industry=TEAM
```

### Example Response
```json
{
  "customerStories": [
    {
      "id": "cmc34d5bo0005c1kf535ghaz7",
      "title": "Fan Engagement Revolution",
      "slug": "fan-engagement-revolution",
      "date": "2025-06-19T00:00:00.000Z",
      "caption": "",
      "description": "Creating immersive fan experiences through digital platforms",
      "seoTitle": null,
      "seoDescription": null,
      "status": "PUBLISHED",
      "publishedAt": "2025-06-19T09:10:24.761Z",
      "createdAt": "2025-06-19T08:28:48.564Z",
      "updatedAt": "2025-06-19T09:10:24.763Z",
      "mediaGallery": [],
      "externalLink": null,
      "industry": "TEAM",
      "solutions": [
        "VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION",
        "GAMING_AND_FAN_LOYALTY"
      ],
      "author": {
        "id": "cmc05x6h00000vha1u4cqf08r",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    },
    {
      "id": "cmc34d5bm0003c1kf6caau0p0",
      "title": "Team Analytics Platform Success Story",
      "slug": "team-analytics-platform-success",
      "date": "2025-06-19T08:28:48.561Z",
      "caption": null,
      "description": "Implementing advanced analytics for team performance",
      "seoTitle": null,
      "seoDescription": null,
      "status": "PUBLISHED",
      "publishedAt": "2025-06-19T08:28:48.561Z",
      "createdAt": "2025-06-19T08:28:48.562Z",
      "updatedAt": "2025-06-19T08:28:48.562Z",
      "mediaGallery": {
        "images": [
          {
            "url": "https://picsum.photos/800/600",
            "aspectRatio": "4:3"
          }
        ]
      },
      "externalLink": null,
      "industry": "TEAM",
      "solutions": [
        "SPORTS_DATA_SOLUTIONS",
        "DIGITAL_PLATFORMS"
      ],
      "author": {
        "id": "cmc05x6h00000vha1u4cqf08r",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

---

## 4. Filter by Industry and Solutions

### Endpoint
```http
GET /api/customerstories?industry={industry}&solutions={solution}
```

### Example Request
```http
GET /api/customerstories?industry=LEAGUES_AND_FEDERATIONS&solutions=FAN_DATA_AND_CRM_CONSULTING
```

### Example Response
```json
{
  "customerStories": [
    {
      "id": "cmc3385mx0001g6dityipqiko",
      "title": "MI Head Coach, Mahela Jayawardene, analyses our campaign",
      "slug": "mi-head-coach-mahela-jayawardene-analyses-our-campaign",
      "date": "2025-06-19T00:00:00.000Z",
      "caption": "Contributors",
      "description": "In the post-match press conference, our Head Coach Mahela Jayawardene appeared to share his thoughts on the match-up against PBKS and if rain had a say on the outcome of the fixture",
      "seoTitle": null,
      "seoDescription": null,
      "status": "PUBLISHED",
      "publishedAt": "2025-06-19T09:17:13.905Z",
      "createdAt": "2025-06-19T07:56:56.073Z",
      "updatedAt": "2025-06-19T09:17:13.907Z",
      "mediaGallery": [],
      "externalLink": null,
      "industry": "LEAGUES_AND_FEDERATIONS",
      "solutions": [
        "GAMING_AND_FAN_LOYALTY",
        "DIGITAL_PLATFORMS",
        "FAN_DATA_AND_CRM_CONSULTING"
      ],
      "author": {
        "id": "cmc05x6h00000vha1u4cqf08r",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## 5. Pagination with Limit

### Endpoint
```http
GET /api/customerstories?limit={limit}&page={page}
```

### Example Request
```http
GET /api/customerstories?limit=5&page=1
```

### Example Response Structure
```json
{
  "customerStories": [
    // Array of customer story objects (max 5 in this case)
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 7,
    "pages": 2
  }
}
```

---

## Data Structure Reference

### Customer Story Object (List View)
```typescript
{
  id: string
  title: string
  slug: string
  date: string (ISO 8601)
  caption: string | null
  description: string | null
  seoTitle: string | null
  seoDescription: string | null
  status: "PUBLISHED" | "DRAFT"
  publishedAt: string | null (ISO 8601)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  mediaGallery: MediaItem[] | object
  externalLink: string | null
  industry: Industry
  solutions: Solution[]
  author: {
    id: string
    name: string
    email: string
  }
}
```

### Customer Story Object (Single View)
Includes all fields from List View plus:
```typescript
{
  stats: Array<{
    label: string
    value: string
  }>
  contentSections: Array<{
    title: string
    description: string (HTML)
  }>
  authorId: string
}
```

### Media Gallery Structure
```typescript
// Array format
MediaItem[] = Array<{
  url: string
  aspectRatio: string
  baseFilename?: string
  originalUrl?: string
}>

// Object format (legacy)
{
  images: Array<{
    url: string
    aspectRatio: string
  }>
}
```

### Pagination Object
```typescript
{
  page: number
  limit: number
  total: number
  pages: number
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Customer story not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting
- No rate limiting currently implemented
- All endpoints are public for read operations

## CORS
- CORS is enabled for all origins in development
- Configure appropriately for production

---

## Examples for Common Use Cases

### 1. Get all stories for a specific industry
```bash
curl "http://localhost:3000/api/customerstories?industry=TEAM"
```

### 2. Get stories with specific solution
```bash
curl "http://localhost:3000/api/customerstories?solutions=DIGITAL_PLATFORMS"
```

### 3. Get stories with pagination
```bash
curl "http://localhost:3000/api/customerstories?limit=5&page=2"
```

### 4. Get single story with full content
```bash
curl "http://localhost:3000/api/customerstories?slug=story-slug-here"
```

### 5. Complex filtering
```bash
curl "http://localhost:3000/api/customerstories?industry=GAMING_OPERATORS&solutions=GAMING_AND_FAN_LOYALTY&limit=3"
``` 