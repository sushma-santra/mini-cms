import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadBuffer, generateBaseFilename, getRelativePath } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const aspectRatios = formData.getAll('aspectRatios') as string[]
    
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

    // Generate base filename for the group
    const baseFilename = generateBaseFilename()

    const uploadResults = []

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const aspectRatio = aspectRatios[i]
      
      // Get file extension
      const extension = file.name.split('.').pop() || 'jpg'
      
      // Create filename with aspect ratio
      const fileName = `${baseFilename}-${aspectRatio}.${extension}`

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to S3 with new path structure and get relative path
      const s3Key = `stg/assets/waf-images/uploads/images/${fileName}`
      await uploadBuffer(buffer, s3Key, file.type)
      const imageUrl = getRelativePath(s3Key)

      // Create result object
      uploadResults.push({
        url: imageUrl,
        aspectRatio: aspectRatio,
        fileName: baseFilename, // Use base filename for grouping
        size: file.size,
        type: file.type,
      })
    }

    return NextResponse.json({
      success: true,
      uploads: uploadResults,
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