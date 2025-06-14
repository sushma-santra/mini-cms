'use client'

import { useState, useRef } from 'react'
import ImageCropper, { CroppedImageData } from './ImageCropper'
import { useAuth } from '@/lib/auth-context'
import { generateBaseFilename, getAspectRatioLabel } from '@/lib/image-utils'

export interface UploadedImage {
  id: string
  url: string
  aspectRatio: string
  baseFilename?: string
  file?: File
}

interface MultipleImageUploaderProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export default function MultipleImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10 
}: MultipleImageUploaderProps) {
  const [showCropper, setShowCropper] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCurrentImage(url)
      setShowCropper(true)
    }
  }

  const handleCropComplete = async (crops: CroppedImageData[]) => {
    if (crops.length === 0) return

    setUploading(true)
    try {
      // Generate a base filename for all versions
      const baseFilename = generateBaseFilename()
      
      // Create FormData for multiple upload
      const formData = new FormData()
      
      // Add all cropped images and their aspect ratios
      crops.forEach((crop, index) => {
        formData.append('files', crop.blob, `${baseFilename}`)
        formData.append('aspectRatios', crop.aspectRatio)
      })
      
      formData.append('baseFilename', baseFilename)

      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      // Create new image objects from upload results
      const newImages = result.uploads.map((upload: any) => ({
        id: `img-${Date.now()}-${upload.aspectRatio}`,
        url: upload.url,
        aspectRatio: upload.aspectRatio,
        baseFilename: upload.fileName,
      }))

      // Add all new images to the list
      onImagesChange([...images, ...newImages])
      setShowCropper(false)
      setCurrentImage(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setCurrentImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (imageId: string) => {
    onImagesChange(images.filter(img => img.id !== imageId))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  // Group images by base filename to show them together
  const groupedImages = images.reduce((groups, image) => {
    const key = image.baseFilename || image.id
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(image)
    return groups
  }, {} as Record<string, UploadedImage[]>)

  const totalImageGroups = Object.keys(groupedImages).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Images ({totalImageGroups}/{maxImages} sets, {images.length} total versions)
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={totalImageGroups >= maxImages || uploading}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Image
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Images Grid - Grouped by base filename */}
      {Object.keys(groupedImages).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedImages).map(([baseFilename, imageGroup], groupIndex) => (
            <div key={baseFilename} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Image Set {groupIndex + 1} ({imageGroup.length} versions)
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    // Remove all images in this group
                    const idsToRemove = imageGroup.map(img => img.id)
                    onImagesChange(images.filter(img => !idsToRemove.includes(img.id)))
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove all versions
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {imageGroup.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={image.url}
                        alt={`${getAspectRatioLabel(image.aspectRatio)} version`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image overlay with controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="p-1 bg-red-500 bg-opacity-70 rounded-full text-white hover:bg-opacity-90"
                        title="Remove this version"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Aspect ratio label */}
                    <div className="absolute bottom-1 left-1 right-1">
                      <span className="inline-block w-full px-2 py-1 text-xs font-medium text-white bg-black bg-opacity-70 rounded text-center truncate">
                        {getAspectRatioLabel(image.aspectRatio)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-gray-300 border-dashed rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload an image and crop it for multiple aspect ratios
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Image
            </button>
          </div>
        </div>
      )}

      {/* Upload status */}
      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center px-4 py-2 text-sm text-indigo-600">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
            Uploading and processing images...
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && currentImage && (
        <ImageCropper
          image={currentImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
} 