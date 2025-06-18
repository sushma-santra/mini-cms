import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    // Replace periods between digits and letters with nothing (no.6 -> no6, v2.5 -> v25)
    .replace(/([a-z0-9])\.([a-z0-9])/g, '$1$2')
    // Replace remaining periods with hyphens
    .replace(/\./g, '-')
    // Replace ampersands with 'and'
    .replace(/&/g, 'and')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Remove any remaining special characters except hyphens and alphanumeric
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    .trim()
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export function extractTextFromHtml(html: string): string {
  // Simple HTML tag removal for excerpt generation
  return html.replace(/<[^>]*>/g, '').trim()
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const text = extractTextFromHtml(content)
  return truncateText(text, maxLength)
} 