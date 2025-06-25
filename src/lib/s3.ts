import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { fromInstanceMetadata, fromIni } from '@aws-sdk/credential-providers'

let s3Client: S3Client

// S3 Client configuration using environment-specific credentials
if (process.env.isAWS === 'true') {
  // EC2/ECS Production environment - use IAM roles
  console.log("Using AWS IAM roles for credentials (EC2/ECS)")
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: fromInstanceMetadata(),
  })
} else {
  // Local development - use AWS CLI profile
  console.log("Setting up AWS credentials for local development")
  console.log("Using AWS credentials from AWS CLI profile")
  console.log("AWS_PROFILE", process.env.AWS_PROFILE)
  console.log("AWS_REGION", process.env.AWS_REGION)
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: fromIni({
        profile: process.env.AWS_PROFILE || "default"
      }),
    })
  } catch (error) {
    throw new Error(
      "AWS credentials not found. Please configure AWS CLI with 'aws configure' command\n" +
      "Error: " + error
    )
  }
}

export const uploadFile = async (file: File, key: string): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer()
    
    // Check if bucket is configured
    if (!process.env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET environment variable is not set')
    }
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
    })

    await s3Client.send(command)
    
    // Return relative path instead of full S3 URL
    return key
  } catch (error) {
    console.error('S3 upload error:', error)
    console.error('S3 configuration:', {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      profile: process.env.AWS_PROFILE
    })
    throw error
  }
}

export const uploadBuffer = async (buffer: Buffer, key: string, contentType: string): Promise<string> => {
  try {
    // Check if bucket is configured
    if (!process.env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET environment variable is not set')
    }
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3Client.send(command)
    
    // Return relative path instead of full S3 URL
    return key
  } catch (error) {
    console.error('S3 uploadBuffer error:', error)
    console.error('S3 configuration:', {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      profile: process.env.AWS_PROFILE
    })
    throw error
  }
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

export const generateBaseFilename = (originalName?: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  
  if (originalName) {
    // Remove extension and special characters, replace spaces with hyphens
    const cleanName = originalName
      .split('.')[0]
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .slice(0, 50) // Limit length
    return `${cleanName}-${timestamp}-${randomString}`
  }
  
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

export const getS3CvKey = (filename: string): string => {
  return `stg/static-assets/uploadfile/resumes/${filename}`
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

// Helper function to construct full URL from relative path for client-side display
export const getS3Url = (relativePath: string): string => {
  if (!relativePath) return ''
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  const domain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN
  if (!domain) {
    throw new Error('NEXT_PUBLIC_IMAGE_DOMAIN environment variable is not set')
  }
  
  return `${domain}/assets/waf-images/uploads/${relativePath}`
}

// Helper function to construct full URL from relative path for client-side display (public function)
export const getPublicS3Url = (relativePath: string): string => {
  if (!relativePath) return ''
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  
  const domain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN
  if (!domain) {
    throw new Error('NEXT_PUBLIC_IMAGE_DOMAIN environment variable is not set')
  }
  
  return `${domain}/assets/waf-images/uploads/${relativePath}`
} 