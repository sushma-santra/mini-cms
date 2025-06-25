import { z } from 'zod'

// Custom URL validator
export const urlSchema = z
  .string()
  .refine(
    (url) => {
      if (!url || url.trim() === '') return true // Allow empty URLs
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
    { message: 'Invalid URL format' }
  )
  .optional()

// Image validation schema
export const imageValidationSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  aspectRatio: z.string().optional(),
  baseFilename: z.string().optional(),
  originalUrl: z.string().optional(),
  isExisting: z.boolean().optional(),
  featured: z.boolean().optional()
})

// Post validation schema
export const postValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().optional(),
  fullText: z.string().optional(),
  externalLinks: urlSchema,
  caption: z.string().max(500, 'Caption must be less than 500 characters').optional(),
  description: z.string().optional(),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  categoryId: z.string().min(1, 'Category is required'),
  tagIds: z.array(z.string()).optional(),
  images: z.array(imageValidationSchema).optional()
}).refine(
  (data) => {
    // Either content or external link must be provided
    return (data.fullText && data.fullText.trim().length > 0) || (data.externalLinks && data.externalLinks.trim().length > 0)
  },
  {
    message: 'Either content or external link must be provided',
    path: ['fullText'] // This will show the error on the fullText field
  }
)

// Customer Story validation schema
export const customerStoryValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  caption: z.string().max(500, 'Caption must be less than 500 characters').optional(),
  description: z.string().optional(),
  externalLink: urlSchema,
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  industry: z.enum([
    'LEAGUES_AND_FEDERATIONS',
    'TEAM',
    'BROADCASTERS_AND_OTT_PLATFORMS',
    'PUBLISHERS',
    'GAMING_OPERATORS'
  ]),
  solutions: z.array(z.enum([
    'GAMING_AND_FAN_LOYALTY',
    'DIGITAL_PLATFORMS',
    'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION',
    'FAN_DATA_AND_CRM_CONSULTING',
    'MARKETING_AND_COMMUNITY_MANAGEMENT',
    'DESIGN_AND_VIDEO_PRODUCTION',
    'SPORTS_DATA_SOLUTIONS'
  ])).optional(),
  mediaGallery: z.array(imageValidationSchema).optional(),
  clientLogos: z.array(z.object({
    url: z.string().min(1, 'Logo URL is required'),
    name: z.string().min(1, 'Logo name is required'),
    isExisting: z.boolean().optional()
  })).optional(),
  stats: z.array(z.object({
    label: z.string().min(1, 'Stat label is required'),
    value: z.string().min(1, 'Stat value is required')
  })).optional(),
  contentSections: z.array(z.object({
    title: z.string().min(1, 'Section title is required'),
    description: z.string().min(1, 'Section description is required')
  })).optional()
}).refine(
  (data) => {
    // Either content sections or external link must be provided
    const hasValidContentSections = data.contentSections && data.contentSections.length > 0 && 
      data.contentSections.some(section => section.title.trim() && section.description.trim())
    const hasExternalLink = data.externalLink && data.externalLink.trim().length > 0
    return hasValidContentSections || hasExternalLink
  },
  {
    message: 'Either content sections or external link must be provided',
    path: ['contentSections']
  }
)

// Event validation schema
export const eventValidationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().optional(),
  external_link: urlSchema,
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  venue: z.string().max(200, 'Venue must be less than 200 characters').optional(),
  booth: z.string().max(50, 'Booth must be less than 50 characters').optional(),
  start_date: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Invalid date format'
  }),
  end_date: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Invalid date format'
  }),
  start_time: z.string().max(10, 'Start time must be less than 10 characters').optional(),
  end_time: z.string().max(10, 'End time must be less than 10 characters').optional(),
  join_us_link: urlSchema,
  images: z.array(imageValidationSchema).optional(),
  event_highlights: z.array(z.object({
    title: z.string().min(1, 'Highlight title is required'),
    description: z.string().min(1, 'Highlight description is required')
  })).optional(),
  event_map_embed: z.string().optional(),
  event_details: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED'])
}).refine(
  (data) => {
    // End date must be after start date
    return data.end_date >= data.start_date
  },
  {
    message: 'End date must be after start date',
    path: ['end_date']
  }
)

// Validation error helper
export interface ValidationError {
  field: string
  message: string
}

export const validateContent = <T>(schema: z.ZodSchema<T>, data: any): { isValid: boolean; errors: ValidationError[] } => {
  try {
    schema.parse(data)
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return { isValid: false, errors }
    }
    return { isValid: false, errors: [{ field: 'general', message: 'Validation failed' }] }
  }
}

// Type exports
export type PostValidation = z.infer<typeof postValidationSchema>
export type CustomerStoryValidation = z.infer<typeof customerStoryValidationSchema>
export type EventValidation = z.infer<typeof eventValidationSchema> 