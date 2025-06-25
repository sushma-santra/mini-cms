import { z } from 'zod';

// Base schema for common fields
const baseSchema = {
  captcha: z.string().min(1, 'Captcha verification is required'),
};

// Ebook submission schema
export const ebookSchema = z.object({
  ...baseSchema,
  module_name: z.literal('ebook'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  organisation_name: z.string().min(1, 'Organisation name is required').max(200),
  country: z.string().min(1, 'Country is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  privacy_policy: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  ...baseSchema,
  module_name: z.literal('newsletter'),
  email: z.string().email('Invalid email address').max(255),
});

// Contact submission schema
export const contactSchema = z.object({
  ...baseSchema,
  module_name: z.literal('contacts'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  organisation: z.string().min(1, 'Organisation is required').max(200),
  type_of_organisation: z.string().min(1, 'Type of organisation is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  phone_number: z.string().min(1, 'Phone number is required').max(50),
  email: z.string().email('Invalid email address').max(255),
  message: z.string().min(1, 'Message is required'),
  privacy_policy: z.boolean().optional(),
});

// Careers submission schema (used for form data without file)
export const careersSchema = z.object({
  ...baseSchema,
  module_name: z.literal('careers'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  job_title: z.string().max(200).optional(),
});

// File validation schema for careers CV upload
export const cvFileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File size exceeds 10MB limit'),
  type: z.enum([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ], {
    errorMap: () => ({ message: 'Invalid File Type. Allowed: PDF, DOC, DOCX.' })
  }),
});

// Combined schema for all submission types
export const submissionSchema = z.discriminatedUnion('module_name', [
  ebookSchema,
  newsletterSchema,
  contactSchema,
  careersSchema,
]);

export type EbookSubmission = z.infer<typeof ebookSchema>;
export type NewsletterSubscription = z.infer<typeof newsletterSchema>;
export type ContactSubmission = z.infer<typeof contactSchema>;
export type CareersSubmission = z.infer<typeof careersSchema>;
export type Submission = z.infer<typeof submissionSchema>; 