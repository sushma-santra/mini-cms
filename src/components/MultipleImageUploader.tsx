'use client'

import { useState, useRef } from 'react'
import ImageCropper, { CroppedImageData } from './ImageCropper'
import { useAuth } from '@/lib/auth-context'
import { generateBaseFilename, getAspectRatioLabel } from '@/lib/image-utils'
import { getImageUrl } from '@/lib/image-utils-client'

export interface UploadedImage {
  id: string
  url: string
  aspectRatio: string
  baseFilename?: string
  originalUrl?: string  // New: URL to original uncropped image
  file?: File
  isExisting?: boolean  // Track if this is an existing image vs newly uploaded
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
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [currentImage, setCurrentImage] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)  // For editing existing images
  const [editingImageSet, setEditingImageSet] = useState<string | null>(null)
  const [editingMode, setEditingMode] = useState<'new' | 'replace' | 'selective'>('new')  // New: track editing mode
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const { token, user, isAuthenticated } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCurrentImage(file)
      setCurrentImageUrl(null)  // Clear existing image URL
      setEditingMode('new')  // Set mode to new upload
      setShowCropper(true)
    }
  }

  // Modified to handle both new uploads and editing existing images
  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && editingImageSet) {
      setCurrentImage(file)
      setCurrentImageUrl(null)  // New upload, clear existing URL
      setEditingMode('replace')  // Set mode to replace with new file
      setShowCropper(true)
    }
  }

  // New function to edit existing image (re-crop)
  const startEditingExistingImage = (baseFilename: string) => {
    // Find the first image in the set to get the original URL
    const imageGroup = groupedImages[baseFilename]
    if (imageGroup && imageGroup.length > 0) {
      setEditingImageSet(baseFilename)
      setEditingMode('selective')  // Set mode to selective editing
      
      // Use original image URL if available, otherwise fall back to first cropped image
      const originalUrl = imageGroup[0].originalUrl
      if (originalUrl) {
        setCurrentImageUrl(originalUrl)  // Use original uncropped image
        setCurrentImage(null)  // Clear file since we're using URL
        setShowCropper(true)
      } else {
        // Fallback: if no original URL, use the first cropped image (legacy behavior)
        setCurrentImageUrl(imageGroup[0].url)
        setCurrentImage(null)
        setShowCropper(true)
      }
    }
  }

  // Function to replace with new upload
  const startReplacingImageSet = (baseFilename: string) => {
    setEditingImageSet(baseFilename)
    setEditingMode('replace')  // Set mode to replace entire set
    editFileInputRef.current?.click()
  }

  // Toggle expansion of image sets
  const toggleSetExpansion = (baseFilename: string) => {
    const newExpandedSets = new Set(expandedSets)
    if (expandedSets.has(baseFilename)) {
      newExpandedSets.delete(baseFilename)
    } else {
      newExpandedSets.add(baseFilename)
    }
    setExpandedSets(newExpandedSets)
  }

  // Auto-expand sets with only 1 version, keep others collapsed by default
  const shouldAutoExpand = (imageGroup: UploadedImage[]) => {
    return imageGroup.length === 1
  }

  const handleCropComplete = async (crops: CroppedImageData[]) => {
    if (!currentImage && !currentImageUrl) return

    setUploading(true)
    try {
      // Debug: Check if token exists
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      if (editingMode === 'selective' && editingImageSet && currentImageUrl && !currentImage) {
        // Selective editing - only update the specific aspect ratios that were re-cropped
        const baseFilename = editingImageSet
        
        // Create FormData for the new crops only
        const formData = new FormData()
        
        // Add only the new cropped images and their aspect ratios
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
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        
        // Get the existing image group and original URL
        const existingImageGroup = groupedImages[editingImageSet]
        const originalUrl = existingImageGroup?.[0]?.originalUrl || null
        
        // Create a map of new crops by aspect ratio
        const newCropsByAspectRatio = new Map()
        result.uploads.forEach((upload: any) => {
          // Find the original image to preserve its ID
          const originalImage = images.find(img => 
            img.baseFilename === editingImageSet && img.aspectRatio === upload.aspectRatio
          )
          
          newCropsByAspectRatio.set(upload.aspectRatio, {
            id: originalImage?.id || `img-${Date.now()}-${upload.aspectRatio}`, // Preserve original ID
            url: upload.url + `?t=${Date.now()}`, // Add cache-busting parameter
            aspectRatio: upload.aspectRatio,
            baseFilename: baseFilename,
            originalUrl: originalUrl,
            isExisting: true  // Mark as existing since we're updating existing images
          })
        })
        
        // Update images: keep existing versions that weren't re-cropped, replace ones that were
        const updatedImages = images.map(img => {
          if (img.baseFilename === editingImageSet) {
            // If this aspect ratio was re-cropped, use the new version
            if (newCropsByAspectRatio.has(img.aspectRatio)) {
              return newCropsByAspectRatio.get(img.aspectRatio)
            }
            // Otherwise, keep the existing version
            return img
          }
          // Keep all other images unchanged
          return img
        })
        
        // Add any completely new aspect ratios that didn't exist before
        newCropsByAspectRatio.forEach((newCrop, aspectRatio) => {
          const existsInCurrentImages = images.some(img => 
            img.baseFilename === editingImageSet && img.aspectRatio === aspectRatio
          )
          if (!existsInCurrentImages) {
            updatedImages.push(newCrop)
          }
        })
        
        onImagesChange(updatedImages)
        
        // Force a re-render by updating the expanded sets to trigger UI refresh
        setExpandedSets(prev => new Set([...Array.from(prev), editingImageSet]))
      } else if (editingMode === 'replace' || editingMode === 'new') {
        // Full replacement or new upload - existing behavior
        const baseFilename = editingImageSet || generateBaseFilename()
        
        // Create FormData for multiple upload
        const formData = new FormData()
        
        // Add all cropped images and their aspect ratios
        crops.forEach((crop, index) => {
          formData.append('files', crop.blob, `${baseFilename}`)
          formData.append('aspectRatios', crop.aspectRatio)
        })
        
        // Add original file if we have one (for new uploads)
        if (currentImage) {
          formData.append('originalFile', currentImage)
        }
        
        formData.append('baseFilename', baseFilename)

        const response = await fetch('/api/upload/multiple', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        
        // Get the shared base filename from the API response
        const sharedBaseFilename = result.baseFilename || `upload-${Date.now()}`
        
        // Create new image objects from upload results, including original URL
        const newImages = result.uploads.map((upload: any) => ({
          id: `img-${Date.now()}-${upload.aspectRatio}`,
          url: upload.url,
          aspectRatio: upload.aspectRatio,
          baseFilename: sharedBaseFilename,
          originalUrl: result.originalUrl,  // Include original URL from API response
          isExisting: false  // Mark as new images
        }))

        if (editingImageSet) {
          // Replace existing image set with new images
          const updatedImages = images.filter(img => img.baseFilename !== editingImageSet)
          onImagesChange([...updatedImages, ...newImages])
        } else {
          // Add new images to the list
          onImagesChange([...images, ...newImages])
        }
        
        // Auto-expand the newly created/updated set if it has multiple versions
        if (newImages.length > 1) {
          setExpandedSets(prev => new Set([...Array.from(prev), sharedBaseFilename]))
        }
      }
      
      setShowCropper(false)
      setCurrentImage(null)
      setCurrentImageUrl(null)
      setEditingImageSet(null)
      setEditingMode('new')  // Reset to default mode
      
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (editFileInputRef.current) {
        editFileInputRef.current.value = ''
      }
    } catch (error) {
      alert(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setCurrentImage(null)
    setCurrentImageUrl(null)
    setEditingImageSet(null)
    setEditingMode('new')  // Reset to default mode
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ''
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
    // Use baseFilename if available, otherwise create a unique group for each image
    const key = image.baseFilename || `single-${image.id}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(image)
    return groups
  }, {} as Record<string, UploadedImage[]>)

  const totalImageGroups = Object.entries(groupedImages)
    .filter(([baseFilename, imageGroup]) => 
      imageGroup.length > 0 && imageGroup.some(img => img.url && img.url.trim() !== '')
    ).length

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

      <input
        ref={editFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleEditFileSelect}
        className="hidden"
      />

      {/* Images Grid - Grouped by base filename with collapsible sets */}
      {totalImageGroups > 0 ? (
        <div className="space-y-3">
          {Object.entries(groupedImages)
            .filter(([baseFilename, imageGroup]) => 
              imageGroup.length > 0 && imageGroup.some(img => img.url && img.url.trim() !== '')
            )
            .map(([baseFilename, imageGroup], groupIndex) => {
              const isExpanded = expandedSets.has(baseFilename) || shouldAutoExpand(imageGroup)
              const hasMultipleVersions = imageGroup.length > 1
              
              return (
                <div key={baseFilename} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  {/* Set Header - Always visible */}
                  <div 
                    className={`px-4 py-3 bg-gray-50 border-b border-gray-200 ${hasMultipleVersions ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={hasMultipleVersions ? () => toggleSetExpansion(baseFilename) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {hasMultipleVersions && (
                          <svg 
                            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                <h4 className="text-sm font-medium text-gray-900">
                          Image Set {groupIndex + 1} ({imageGroup.length} version{imageGroup.length !== 1 ? 's' : ''})
                </h4>
                        {hasMultipleVersions && (
                          <span className="text-xs text-gray-500">
                            {isExpanded ? 'Click to collapse' : 'Click to expand'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Quick preview of first image in collapsed state */}
                        {!isExpanded && hasMultipleVersions && (
                          <div className="flex -space-x-1">
                            {imageGroup.slice(0, 3).map((image, idx) => (
                              <div key={`${image.id}-${image.url}-preview`} className="w-8 h-8 rounded border-2 border-white overflow-hidden">
                                <img
                                  src={getImageUrl(image.url)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {imageGroup.length > 3 && (
                              <div className="w-8 h-8 rounded border-2 border-white bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{imageGroup.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditingExistingImage(baseFilename)
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                          title="Edit this image"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            startReplacingImageSet(baseFilename)
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                          title="Replace this image set"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Remove all images in this group
                            const idsToRemove = imageGroup.map(img => img.id)
                            const filteredImages = images.filter(img => !idsToRemove.includes(img.id))
                            onImagesChange(filteredImages)
                            
                            // Also remove from expanded sets to ensure UI cleanup
                            setExpandedSets(prev => {
                              const newSets = new Set(prev)
                              newSets.delete(baseFilename)
                              return newSets
                            })
                          }}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                          title="Remove entire image set"
                        >
                          Remove all
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Set Content - Collapsible */}
                  {isExpanded && (
                    <div className="p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {imageGroup.map((image, index) => (
                    <div key={`${image.id}-${image.url}`} className="relative group">
                      <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={getImageUrl(image.url)}
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
                  )}
                </div>
              )
            })}
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
      {showCropper && (currentImage || currentImageUrl) && (
        <ImageCropper
          image={currentImage ? URL.createObjectURL(currentImage) : currentImageUrl!}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
} 