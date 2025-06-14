// Utility functions for image aspect ratio management

export interface AspectRatioConfig {
  label: string
  value: number | undefined
  name: string
  directory: string
}

export const ASPECT_RATIOS: AspectRatioConfig[] = [
  { label: 'Square (1:1)', value: 1, name: 'square', directory: '1-1' },
  { label: 'Landscape (16:9)', value: 16/9, name: 'landscape', directory: '16-9' },
  { label: 'Portrait (9:16)', value: 9/16, name: 'portrait', directory: '9-16' },
  { label: 'Wide (21:9)', value: 21/9, name: 'wide', directory: '21-9' },
  { label: 'Standard (4:3)', value: 4/3, name: 'standard', directory: '4-3' },
  { label: 'Free', value: undefined, name: 'free', directory: 'free' }
]

/**
 * Generate a consistent filename for all aspect ratios of the same image
 */
export function generateBaseFilename(originalName?: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName?.split('.').pop() || 'jpg'
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * Get the directory path for a specific aspect ratio
 */
export function getAspectRatioDirectory(aspectRatio: string): string {
  const ratio = ASPECT_RATIOS.find(r => r.directory === aspectRatio || r.name === aspectRatio)
  return ratio ? ratio.directory : 'free'
}

/**
 * Get the full upload path for an image with aspect ratio
 */
export function getUploadPath(baseFilename: string, aspectRatio: string): string {
  const directory = getAspectRatioDirectory(aspectRatio)
  return `/uploads/images/${directory}/${baseFilename}`
}

/**
 * Get aspect ratio configuration by name
 */
export function getAspectRatioConfig(name: string): AspectRatioConfig | undefined {
  return ASPECT_RATIOS.find(r => r.name === name)
}

/**
 * Get aspect ratio label by directory name
 */
export function getAspectRatioLabel(aspectRatio: string): string {
  const ratio = ASPECT_RATIOS.find(r => r.directory === aspectRatio || r.name === aspectRatio)
  return ratio ? ratio.label : aspectRatio
} 