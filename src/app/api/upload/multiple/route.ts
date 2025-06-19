import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadBuffer, generateBaseFilename, getS3Key, getS3OriginalKey, getRelativePath, getImageRelativePath, getOriginalRelativePath } from '@/lib/s3'
import { getAspectRatioDirectory } from '@/lib/image-utils'

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const aspectRatios = formData.getAll('aspectRatios') as string[]
    const originalFile = formData.get('originalFile') as File | null  // New: original image
    const baseFilename = formData.get('baseFilename') as string || generateBaseFilename()
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (files.length !== aspectRatios.length) {
      return NextResponse.json(
        { error: 'Mismatch between files and aspect ratios' },
        { status: 400 }
      )
    }

    // Validate each file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only images are allowed.' },
          { status: 400 }
        )
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB.' },
          { status: 400 }
        )
      }
    }

    // Also validate original file if provided
    if (originalFile) {
      if (!allowedTypes.includes(originalFile.type)) {
        return NextResponse.json(
          { error: 'Invalid original file type. Only images are allowed.' },
          { status: 400 }
        )
      }

      if (originalFile.size > maxSize) {
        return NextResponse.json(
          { error: 'Original file too large. Maximum size is 5MB.' },
          { status: 400 }
        )
      }
    }

    const uploadResults = []
    let originalUrl = null

    // Save original file if provided (for future re-cropping)
    if (originalFile) {
      const originalBytes = await originalFile.arrayBuffer()
      const originalBuffer = Buffer.from(originalBytes)
      const extension = originalFile.name.split('.').pop() || 'jpg'
      const originalKey = getS3OriginalKey(baseFilename, extension)
      
      // Upload to S3 and get relative path
      await uploadBuffer(originalBuffer, originalKey, originalFile.type)
      originalUrl = getOriginalRelativePath(baseFilename, extension)
    }

    // Process each cropped file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const aspectRatio = aspectRatios[i]
      
      // Get directory for this aspect ratio
      const directory = getAspectRatioDirectory(aspectRatio)
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const extension = file.name.split('.').pop() || 'jpg'
      
      // Generate S3 key for this aspect ratio
      const s3Key = getS3Key(baseFilename, directory, extension)
      
      // Upload to S3 and get relative path
      await uploadBuffer(buffer, s3Key, file.type)
      const imageUrl = getImageRelativePath(baseFilename, directory, extension)

      // Create result object
      uploadResults.push({
        url: imageUrl,
        aspectRatio: aspectRatio,
        directory: directory,
        fileName: baseFilename,
        size: file.size,
        type: file.type,
      })
    }

    return NextResponse.json({
      success: true,
      uploads: uploadResults,
      originalUrl: originalUrl,  // Return relative path for original image
      baseFilename: baseFilename,
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