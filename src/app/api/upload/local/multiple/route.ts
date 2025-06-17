import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    
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
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const baseFilename = `${timestamp}-${randomString}`

    const uploadResults = []

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

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

      // Write file to disk
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      // Create result object
      uploadResults.push({
        url: `/uploads/images/${fileName}`,
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