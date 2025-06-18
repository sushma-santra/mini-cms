import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'
import { generateBaseFilename, getAspectRatioDirectory } from '@/lib/image-utils'

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
      const originalDir = path.join(process.cwd(), 'public', 'uploads', 'images', 'originals')
      
      // Create directory if it doesn't exist
      const fs = require('fs')
      if (!fs.existsSync(originalDir)) {
        fs.mkdirSync(originalDir, { recursive: true })
      }

      // Convert original file to buffer and save
      const originalBytes = await originalFile.arrayBuffer()
      const originalBuffer = Buffer.from(originalBytes)
      const originalFilePath = path.join(originalDir, baseFilename)
      await writeFile(originalFilePath, originalBuffer)
      
      originalUrl = `/uploads/images/originals/${baseFilename}`
    }

    // Process each cropped file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const aspectRatio = aspectRatios[i]
      
      // Get directory for this aspect ratio
      const directory = getAspectRatioDirectory(aspectRatio)
      
      // Create directory path
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images', directory)
      
      // Create directory if it doesn't exist
      const fs = require('fs')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Write file to disk
      const filePath = path.join(uploadDir, baseFilename)
      await writeFile(filePath, buffer)

      // Create result object
      uploadResults.push({
        url: `/uploads/images/${directory}/${baseFilename}`,
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
      originalUrl: originalUrl,  // New: return original image URL
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