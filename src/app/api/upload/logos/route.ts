import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadBuffer, getS3LogoKey, getRelativePath } from '@/lib/s3'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
        }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File too large: ${file.name}. Maximum size is 5MB.` 
        }, { status: 400 })
      }
    }

    const uploads = []

    for (const file of files) {
      try {
        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop()
        const filename = `client-logo-${timestamp}-${randomString}.${fileExtension}`

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to S3
        const s3Key = getS3LogoKey(filename)
        await uploadBuffer(buffer, s3Key, file.type)
        const url = getRelativePath(s3Key)

        uploads.push({
          url,
          originalName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
          filename,
          size: file.size,
          type: file.type
        })

      } catch (error) {
        console.error('Error uploading file:', file.name, error)
        return NextResponse.json({ 
          error: `Failed to upload ${file.name}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      uploads,
      message: `Successfully uploaded ${uploads.length} logo(s)`
    })

  } catch (error) {
    console.error('Error in logo upload:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 