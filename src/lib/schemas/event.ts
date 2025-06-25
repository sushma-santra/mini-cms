import { z } from 'zod'

// Custom URL validator that accepts both absolute and relative URLs
export const urlSchema = z.string().refine(
  (url) => {
    // Accept absolute URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }
    // Accept relative URLs that start with / or images/ and contain no spaces
    return (url.startsWith('/') || url.startsWith('images/')) && !url.includes(' ')
  },
  { message: 'Invalid URL' }
)

// Image schema used across the application
export const imageSchema = z.object({
  url: urlSchema,
  aspectRatio: z.string().optional(),
  baseFilename: z.string().optional(),
  originalUrl: urlSchema.optional(),
  isExisting: z.boolean().optional(),
  featured: z.boolean().optional()
})

// Event highlight schema
export const eventHighlightSchema = z.object({
  title: z.string().min(1, "Highlight title is required"),
  description: z.string().min(1, "Highlight description is required")
})

// Base event schema with all fields
export const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().optional(),
  external_link: z.string().url("Invalid external link URL").or(z.literal('')).optional(),
  country: z.string().max(100, "Country must be less than 100 characters").optional(),
  state: z.string().max(100, "State must be less than 100 characters").optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  venue: z.string().max(200, "Venue must be less than 200 characters").optional(),
  booth: z.string().max(50, "Booth must be less than 50 characters").optional(),
  start_date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "That's not a date!",
  }),
  end_date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "That's not a date!",
  }),
  start_time: z.string().max(10, "Start time must be less than 10 characters").optional(),
  end_time: z.string().max(10, "End time must be less than 10 characters").optional(),
  join_us_link: z.string().url("Invalid join us link URL").or(z.literal('')).optional(),
  image: imageSchema.nullable().optional(),
  images: z.array(imageSchema).optional(),
  event_highlights: z.array(eventHighlightSchema).optional(),
  event_map_embed: z.string().optional(),
  event_details: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})

// Schema for the API endpoint, which receives dates as strings
export const eventApiSchema = baseEventSchema.extend({
  start_date: z.string(),
  end_date: z.string(),
})

// Schema for creating a new event
export const createEventSchema = baseEventSchema

// Schema for updating an event - all fields are optional
export const updateEventSchema = baseEventSchema.partial()

// Standard Prisma select object for events list
export const eventListSelect = {
  id: true,
  title: true,
  slug: true,
  external_link: true,
  country: true,
  state: true,
  city: true,
  venue: true,
  booth: true,
  start_date: true,
  end_date: true,
  start_time: true,
  end_time: true,
  join_us_link: true,
  images: true,
  event_map_embed: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: { id: true, name: true, email: true },
  },
} as const

// Select object for a single event, including details
export const eventDetailSelect = {
  ...eventListSelect,
  event_highlights: true,
  event_details: true,
} as const 