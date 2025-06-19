import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 Client configuration using AWS profiles
// The AWS SDK will automatically use the default profile from ~/.aws/credentials
// or you can specify a profile name via AWS_PROFILE environment variable
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // Remove explicit credentials - AWS SDK will use profile credentials automatically
  // This is more secure than using access keys in environment variables
})

export const uploadFile = async (file: File, key: string): Promise<string> => {
  const buffer = await file.arrayBuffer()
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: new Uint8Array(buffer),
    ContentType: file.type,
  })

  await s3Client.send(command)
  
  // Return relative path instead of full S3 URL
  return key
}

export const uploadBuffer = async (buffer: Buffer, key: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  await s3Client.send(command)
  
  // Return relative path instead of full S3 URL
  return key
}

export const deleteFile = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

export const generateUploadUrl = async (key: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `stg/assets/waf-images/uploads/${timestamp}-${randomString}.${extension}`
}

export const generateBaseFilename = (): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomString}`
}

export const getS3Key = (baseFilename: string, aspectRatio: string, extension: string = 'jpg'): string => {
  return `stg/assets/waf-images/uploads/images/${aspectRatio}/${baseFilename}.${extension}`
}

export const getS3OriginalKey = (baseFilename: string, extension: string = 'jpg'): string => {
  return `stg/assets/waf-images/uploads/images/originals/${baseFilename}.${extension}`
}

export const getS3LogoKey = (filename: string): string => {
  return `stg/assets/waf-images/uploads/logos/${filename}`
}

// Helper function to get relative path from S3 key
export const getRelativePath = (s3Key: string): string => {
  // Remove the base path and return only the relative part
  const basePath = 'stg/assets/waf-images/uploads/'
  if (s3Key.startsWith(basePath)) {
    return s3Key.substring(basePath.length)
  }
  return s3Key
}

// Helper function to get relative path for images
export const getImageRelativePath = (baseFilename: string, aspectRatio: string, extension: string = 'jpg'): string => {
  return `images/${aspectRatio}/${baseFilename}.${extension}`
}

// Helper function to get relative path for original images
export const getOriginalRelativePath = (baseFilename: string, extension: string = 'jpg'): string => {
  return `images/originals/${baseFilename}.${extension}`
}

// Helper function to construct full S3 URL from relative path for client-side display
export const getS3Url = (relativePath: string): string => {
  if (!relativePath) return ''
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  // Construct full S3 URL from relative path
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/stg/assets/waf-images/uploads/${relativePath}`
}

// Helper function to construct full S3 URL from relative path for client-side display (public function)
export const getPublicS3Url = (relativePath: string): string => {
  if (!relativePath) return ''
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  // Construct full S3 URL from relative path
  // Note: This should be used only for public assets that don't require authentication
  return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'your-bucket-name'}.s3.amazonaws.com/stg/assets/waf-images/uploads/${relativePath}`
} 