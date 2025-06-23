# Events API Documentation (Frontend)

This document provides detailed information about the Events API endpoints for frontend developers. It includes example requests and responses to facilitate integration.


---

## Event Model

The `Event` model represents a single event in the system.

| Field              | Type      | Description                               |
| ------------------ | --------- | ----------------------------------------- |
| `id`               | `String`  | Unique identifier for the event.          |
| `title`            | `String`  | The title of the event.                   |
| `slug`             | `String`  | URL-friendly slug for the event.          |
| `external_link`    | `String?` | An optional external link for the event.  |
| `country`          | `String?` | The country where the event is held.      |
| `state`            | `String?` | The state where the event is held.        |
| `city`             | `String?` | The city where the event is held.         |
| `venue`            | `String?` | The venue of the event.                   |
| `booth`            | `String?` | The booth number at the event.            |
| `start_date`       | `DateTime`| The start date and time of the event.     |
| `end_date`         | `DateTime`| The end date and time of the event.       |
| `start_time`       | `String?` | The start time of the event.              |
| `end_time`         | `String?` | The end time of the event.                |
| `join_us_link`     | `String?` | A link to join the event.                 |
| `event_map_embed`  | `String?` | An embedded map for the event location.   |
| `event_details`    | `String?` | Detailed information about the event.     |
| `authorId`         | `String`  | The ID of the user who created the event. |
| `createdAt`        | `DateTime`| The date and time when the event was created. |
| `publishedAt`      | `DateTime?`| The date and time when the event was published. |
| `status`           | `PostStatus` | The status of the event (`DRAFT`, `PUBLISHED`). |
| `updatedAt`        | `DateTime`| The date and time when the event was last updated. |
| `image`            | `Json?`   | An optional image for the event.          |
| `event_highlights` | `Json?`   | Optional highlights of the event.         |

---

## 1. Get All Events

Retrieves a paginated list of events.

-   **Endpoint:** `GET /api/events`
-   **Method:** `GET`

### Query Parameters

| Parameter | Type     | Description                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| `page`    | `Int`    | The page number for pagination (default: `1`).               |
| `limit`   | `Int`    | The number of events per page (default: `20`, max: `100`).   |
| `status`  | `String` | Filter events by status (`DRAFT`, `PUBLISHED`). (Admin/Author only) |
| `search`  | `String` | Search for events by title, details, country, city, or venue. |
| `slug`    | `String` | Retrieve a specific event by its slug.                       |

### Example Success Response (200 OK)

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

---

---

## 2. Get Single Event

Retrieves a single event by its ID.

-   **Endpoint:** `GET /api/events/[id]`
-   **Method:** `GET`

### Example Success Response (200 OK)

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

### Example Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "Event not found"
}
```

---


### Example Success Response (200 OK)
Returns the updated event object, similar to the `GET /api/events/[id]` response.

### Example Error Response (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied"
}
```

---
