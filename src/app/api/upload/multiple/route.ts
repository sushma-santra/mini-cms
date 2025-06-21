import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadBuffer, generateBaseFilename, getS3Key, getImageRelativePath } from '@/lib/s3'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const aspectRatios = formData.getAll('aspectRatios') as string[]
    const originalFile = formData.get('originalFile') as File | null
    const providedBaseFilename = formData.get('baseFilename') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length !== aspectRatios.length) {
      return NextResponse.json(
        { error: 'Number of files does not match number of aspect ratios' },
        { status: 400 }
      )
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
          { status: 400 }
        )
      }
    }

    const uploadResults = []
    let originalUrl = null

    // Generate base filename using original file name if available
    const baseFilename = providedBaseFilename || 
      (originalFile ? generateBaseFilename(originalFile.name) : generateBaseFilename())

    // Upload original file if provided
    if (originalFile) {
      const bytes = await originalFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const extension = originalFile.name.split('.').pop() || 'jpg'
      
      // Upload original to S3
      const s3Key = getS3Key(baseFilename, 'originals', extension)
      await uploadBuffer(buffer, s3Key, originalFile.type)
      
      // Get relative path for client
      originalUrl = getImageRelativePath(baseFilename, 'originals', extension)
    }

    // Process each cropped image
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const aspectRatio = aspectRatios[i]
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const extension = file.name.split('.').pop() || 'jpg'

      // Upload to S3 with new path structure and get relative path
      const s3Key = getS3Key(baseFilename, aspectRatio, extension)
      await uploadBuffer(buffer, s3Key, file.type)
      const imageUrl = getImageRelativePath(baseFilename, aspectRatio, extension)

      // Create result object
      uploadResults.push({
        url: imageUrl,
        aspectRatio: aspectRatio,
        baseFilename: baseFilename,
        size: file.size,
        type: file.type,
        originalName: file.name // Include original file name in response
      })
    }

    return NextResponse.json({
      success: true,
      uploads: uploadResults,
      baseFilename: baseFilename,
      originalUrl: originalUrl,
      totalFiles: files.length,
    })
  } catch (error) {
    console.error('Multiple upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
} 