// Client-side utility functions for handling image URLs

/**
 * Converts a relative image path to a full S3 URL for display
 * @param relativePath - The relative path from the API (e.g., "images/1-1/filename.jpg")
 * @returns Full S3 URL for the image
 */
export const getImageUrl = (relativePath: string): string => {
  if (!relativePath) return ''
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  // Construct full S3 URL from relative path
  // Use environment variable for bucket name (should be set in .env.local)
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET
  if (!bucketName) {
    // Return relative path as fallback if environment variable is not set
    return relativePath
  }
  
  return `https://${bucketName}.s3.amazonaws.com/stg/assets/waf-images/uploads/${relativePath}`
}

/**
 * Converts multiple image objects with relative URLs to full URLs
 * @param images - Array of image objects with url property
 * @returns Array of image objects with full URLs
 */
export const convertImageUrls = (images: Array<{ url: string; [key: string]: any }>) => {
  return images.map(image => ({
    ...image,
    url: getImageUrl(image.url)
  }))
}

/**
 * Converts a single image object with relative URLs to full URLs
 * @param image - Image object with url and optional originalUrl properties
 * @returns Image object with full URLs
 */
export const convertImageUrl = (image: { url: string; originalUrl?: string; [key: string]: any }) => {
  return {
    ...image,
    url: getImageUrl(image.url),
    originalUrl: image.originalUrl ? getImageUrl(image.originalUrl) : undefined
  }
} 