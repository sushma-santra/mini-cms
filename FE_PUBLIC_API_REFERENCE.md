# Frontend Public API Reference

This document provides a unified reference for all public API endpoints available to the frontend team, including Posts, Customer Stories, and Events. Each section includes endpoint details, parameters, and sample requests/responses for easy integration.

---

## Table of Contents
- [Posts](#posts)
- [Customer Stories](#customer-stories)
- [Events](#events)
- [Form Submission](#form-submission)

---

## Posts

### Base Endpoint
```
GET /api/content
```

### Parameters
| Parameter         | Type    | Description                                   | Example |
|-------------------|---------|-----------------------------------------------|---------|
| `cat`             | string  | Category filter                               | `blogs`, `media`, `case-studies` |
| `cat`             | string  | Multiple categories (comma-separated)         | `blogs,media` |
| `slug`            | string  | Specific content slug                         | `my-blog-post-title` |
| `page`            | number  | Page number (default: 1)                      | `1`, `2`, `3` |
| `limit`           | number  | Items per page (default: 20)                  | `5`, `10`, `20` |
| `totalContent`    | number  | Total items for mixed feeds                   | `5`, `10` |
| `relatedcontent`  | boolean | Include related content based on shared tags  | `true`, `false` |

### Example Requests
- List all content:
  ```http
  GET /api/content
  GET /api/content?page=1&limit=20
  ```
- List by category:
  ```http
  GET /api/content?cat=blogs
  GET /api/content?cat=media&page=2&limit=5
  GET /api/content?cat=case-studies
  ```
- Get by slug:
  ```http
  GET /api/content?cat=blogs&slug=my-blog-post-title
  GET /api/content?cat=media&slug=my-media-item
  GET /api/content?cat=case-studies&slug=australia-star-smashes-record-equalling-13-sixes-in-backs-to-wall-mlc-century-from-no6
  ```
- Get with related content:
  ```http
  GET /api/content?cat=blogs&slug=my-blog-post-title&relatedcontent=true
  GET /api/content?cat=blogs&slug=my-blog-post-title&relatedcontent=true&limit=5
  GET /api/content?cat=case-studies&slug=my-case-study&relatedcontent=true&limit=3
  ```
- Mixed category feed:
  ```http
  GET /api/content?cat=blogs,media&totalContent=5
  GET /api/content?cat=blogs,case-studies&totalContent=8
  ```

### Example List Response
```json
{
  "success": true,
  "data": [
    {
      "id": "cmc1qheaw0001af861yc8csy6",
      "title": "Australia star smashes record-equalling 13 sixes in backs-to-wall MLC century from No.6",
      "slug": "australia-star-smashes-record-equalling-13-sixes-in-backs-to-wall-mlc-century-from-no6",
      "fullText": "<p>...</p>",
      "caption": "Australia all-rounder Glenn Maxwell scored a stunning century...",
      "description": "<p>Australia all-rounder Glenn Maxwell scored a stunning century...</p>",
      "externalLinks": "https://www.wisden.com/...",
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

### Example Single Content Response
```json
{
  "success": true,
  "data": {
    "id": "cmc1qheaw0001af861yc8csy6",
    "title": "Australia star smashes record-equalling 13 sixes in backs-to-wall MLC century from No.6",
    "slug": "australia-star-smashes-record-equalling-13-sixes-in-backs-to-wall-mlc-century-from-no6",
    "fullText": "<p>...</p>",
    "caption": "Australia all-rounder Glenn Maxwell scored a stunning century...",
    "description": "<p>Australia all-rounder Glenn Maxwell scored a stunning century...</p>",
    "externalLinks": "https://www.wisden.com/...",
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

---

## Customer Stories

### Base Endpoint
```
GET /api/customerstories
```

### Parameters
| Parameter         | Type    | Description                                   | Example |
|-------------------|---------|-----------------------------------------------|---------|
| `page`            | number  | Page number (default: 1)                      | `1`, `2`, `3` |
| `limit`           | number  | Items per page (default: 20)                  | `5`, `10`, `20` |
| `status`          | string  | Filter by status (`DRAFT`, `PUBLISHED`)       | `PUBLISHED` |
| `search`          | string  | Search by title, description, etc.            | `acme` |
| `slug`            | string  | Get a specific story by slug                  | `how-acme-corp-increased-revenue-by-150` |

### Example Requests
- List customer stories:
  ```http
  GET /api/customerstories?page=1&limit=10&status=PUBLISHED&search=acme
  ```
- Get by slug:
  ```http
  GET /api/customerstories?slug=how-acme-corp-increased-revenue-by-150
  ```

### Example List Response
```json
{
  "success": true,
  "data": [
    {
      "id": "story-1",
      "title": "How Acme Corp Increased Revenue by 150%",
      "date": "2024-06-19T00:00:00.000Z",
      "caption": "A success story about digital transformation",
      "description": "How we helped Acme Corp transform their business...",
      "stats": [
        { "label": "Revenue Growth", "value": "150%" },
        { "label": "Time Saved", "value": "40 hours/month" }
      ],
      "contentSections": [
        {
          "title": "The Challenge",
          "description": "<p>Acme Corp was struggling with...</p>"
        },
        {
          "title": "The Solution", 
          "description": "<p>We implemented a comprehensive...</p>"
        }
      ],
      "status": "PUBLISHED",
      "categoryId": "cat-id-123",
      "tagIds": ["tag-1", "tag-2"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## Events

### Base Endpoint
```
GET /api/events
```

### Parameters
| Parameter         | Type    | Description                                   | Example |
|-------------------|---------|-----------------------------------------------|---------|
| `page`            | number  | Page number (default: 1)                      | `1`, `2`, `3` |
| `limit`           | number  | Items per page (default: 20)                  | `5`, `10`, `20` |
| `status`          | string  | Filter by status (`DRAFT`, `PUBLISHED`)       | `PUBLISHED` |
| `search`          | string  | Search by title, details, country, city, venue| `tech` |
| `slug`            | string  | Get a specific event by slug                  | `annual-tech-conference-2025` |

### Example Requests
- List events:
  ```http
  GET /api/events?page=1&limit=20
  ```
- Get by slug:
  ```http
  GET /api/events?slug=annual-tech-conference-2025
  ```

### Example List Response
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [
    {
      "id": "clxun2p7g000008l3g1h2a9b8",
      "title": "Annual Tech Conference 2025",
      "slug": "annual-tech-conference-2025",
      "start_date": "2025-10-20T09:00:00.000Z",
      "end_date": "2025-10-22T17:00:00.000Z",
      "status": "PUBLISHED",
      "author": {
        "name": "Admin User"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 98,
    "limit": 20
  },
  "filters": {
    "status": "PUBLISHED",
    "search": null,
    "role": "PUBLIC"
  }
}
```

### Example Single Event Response
```json
{
    "success": true,
    "message": "Event retrieved successfully",
    "data": {
        "id": "clxun2p7g000008l3g1h2a9b8",
        "title": "Annual Tech Conference 2025",
        "slug": "annual-tech-conference-2025",
        "external_link": "https://example.com/tech-conference-2025",
        "country": "USA",
        "state": "California",
        "city": "San Francisco",
        "venue": "Moscone Center",
        "booth": "A123",
        "start_date": "2025-10-20T09:00:00.000Z",
        "end_date": "2025-10-22T17:00:00.000Z",
        "start_time": "09:00 AM",
        "end_time": "05:00 PM",
        "join_us_link": "https://example.com/join-us",
        "event_map_embed": "<iframe src='https://www.google.com/maps/embed/...'></iframe>",
        "event_details": "Join us for the largest tech conference of the year.",
        "authorId": "clxun2p7g000108l3h4j5k6l7",
        "publishedAt": "2024-06-26T10:00:00.000Z",
        "status": "PUBLISHED",
        "image": {
            "url": "/uploads/image.jpg",
            "aspectRatio": "16/9"
        },
        "event_highlights": [
            {
                "title": "Keynote by CEO",
                "description": "Our CEO will be delivering the opening keynote."
            }
        ],
        "author": {
            "name": "Admin User"
        }
    }
}
```

---

## Form Submission

### Base Endpoint
```
POST /api/submit
```

### Description
Submit forms for ebook downloads, newsletter subscriptions, or contact requests. The payload must include a `module_name` field to specify the type.

### Sample Payloads

#### 1. Ebook Submission
```json
{
  "module_name": "ebook",
  "first_name": "John",
  "last_name": "Doe",
  "organisation_name": "Acme Corp",
  "country": "USA",
  "email": "john.doe@example.com",
  "privacy_policy": true,
  "captcha": "<recaptcha-token>"
}
```

#### 2. Newsletter Subscription
```json
{
  "module_name": "newsletter",
  "email": "john.doe@example.com",
  "captcha": "<recaptcha-token>"
}
```

#### 3. Contact Submission
```json
{
  "module_name": "contacts",
  "first_name": "Jane",
  "last_name": "Smith",
  "organisation": "Beta Inc",
  "type_of_organisation": "Startup",
  "country": "India",
  "phone_number": "+91-1234567890",
  "email": "jane.smith@example.com",
  "message": "I would like to know more about your services.",
  "privacy_policy": true,
  "captcha": "<recaptcha-token>"
}
```

#### 4. Career Submission (Form Data)
For career submissions with optional CV file upload, use `multipart/form-data` format:

**Form Data Fields:**
```
module_name: careers
first_name: John
last_name: Doe
email: john.doe@example.com
job_title: Software Developer (optional)
cv_file: [PDF/DOC/DOCX file] (optional, max 10MB)
captcha: <recaptcha-token>
```

**Supported File Types:** PDF, DOC, DOCX  
**Maximum File Size:** 10MB  
**File Field Name:** `cv_file`  

**Example using curl:**
```bash
curl -X POST http://localhost:3001/api/submit \
  -F "module_name=careers" \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "email=john.doe@example.com" \
  -F "job_title=Software Developer" \
  -F "captcha=<recaptcha-token>" \
  -F "cv_file=@/path/to/resume.pdf"
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Submission successful",
  "data": [],
  "pagination": {},
  "filters": {}
}
```

### Validation Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["first_name"],
      "message": "Required"
    }
  ],
  "pagination": {},
  "filters": {}
}
```

### Captcha Error Response (400)
```json
{
  "error": "Invalid captcha verification"
}
```

### File Validation Error Response (400)
For career submissions with invalid files:
```json
{
  "success": false,
  "message": "File validation failed",
  "data": [
    {
      "code": "invalid_enum_value",
      "options": [
        "application/pdf",
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ],
      "path": ["type"],
      "message": "Invalid File Type. Allowed: PDF, DOC, DOCX."
    }
  ],
  "pagination": {},
  "filters": {}
}
```

### File Upload Error Response (500)
```json
{
  "success": false,
  "message": "Failed to upload CV file",
  "data": [],
  "pagination": {},
  "filters": {}
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "data": [],
  "pagination": {},
  "filters": {}
}
```

--- 