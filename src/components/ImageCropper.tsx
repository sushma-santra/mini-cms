'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

interface ImageCropperProps {
  image: string
  onCropComplete: (crops: CroppedImageData[]) => void
  onCancel: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface CroppedImageData {
  blob: Blob
  aspectRatio: string
  aspectRatioName: string
}

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: 1, name: 'square', directory: '1-1' },
  { label: 'Landscape (16:9)', value: 16/9, name: 'landscape', directory: '16-9' },
  { label: 'Portrait (9:16)', value: 9/16, name: 'portrait', directory: '9-16' },
  { label: 'Wide (21:9)', value: 21/9, name: 'wide', directory: '21-9' },
  { label: 'Standard (4:3)', value: 4/3, name: 'standard', directory: '4-3' },
  { label: 'Free', value: undefined, name: 'free', directory: 'free' }
]

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [aspectRatioName, setAspectRatioName] = useState('square')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [loading, setLoading] = useState(false)
  const [crops, setCrops] = useState<CroppedImageData[]>([])
  const [selectedRatios, setSelectedRatios] = useState<string[]>([])

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropAreaChange = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Set canvas size to match the crop area
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg', 0.9)
    })
  }

  const handleAddCrop = async () => {
    if (!croppedAreaPixels) return

    setLoading(true)
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      const currentRatio = ASPECT_RATIOS.find(r => r.name === aspectRatioName)
      
      if (currentRatio) {
        const newCrop: CroppedImageData = {
          blob: croppedImage,
          aspectRatio: currentRatio.directory,
          aspectRatioName: currentRatio.name
        }
        
        // Remove existing crop for this aspect ratio if it exists
        const updatedCrops = crops.filter(c => c.aspectRatioName !== aspectRatioName)
        setCrops([...updatedCrops, newCrop])
        setSelectedRatios([...selectedRatios.filter(r => r !== aspectRatioName), aspectRatioName])
      }
    } catch (error) {
      console.error('Error cropping image:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCrop = (aspectRatioName: string) => {
    setCrops(crops.filter(c => c.aspectRatioName !== aspectRatioName))
    setSelectedRatios(selectedRatios.filter(r => r !== aspectRatioName))
  }

  const handleUploadAll = () => {
    if (crops.length > 0) {
      onCropComplete(crops)
    }
  }

  const handleAspectRatioChange = (ratio: number | undefined, name: string) => {
    setAspectRatio(ratio || 1)
    setAspectRatioName(name)
  }

  const isRatioCropped = (ratioName: string) => {
    return selectedRatios.includes(ratioName)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Crop Image for Multiple Ratios</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cropper */}
          <div className="lg:col-span-2">
            {/* Aspect Ratio Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.name}
                    type="button"
                    onClick={() => handleAspectRatioChange(ratio.value, ratio.name)}
                    className={`px-3 py-1 text-sm rounded-md border relative ${
                      aspectRatioName === ratio.name
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {ratio.label}
                    {isRatioCropped(ratio.name) && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cropper */}
            <div className="relative h-96 mb-4 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropAreaChange}
              />
            </div>

            {/* Zoom Control */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Add Crop Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleAddCrop}
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Add ${ASPECT_RATIOS.find(r => r.name === aspectRatioName)?.label} Crop`}
              </button>
            </div>
          </div>

          {/* Right Column - Cropped Images Preview */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Cropped Versions ({crops.length})
              </h4>
              
              {crops.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500">No crops added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Select a ratio and click "Add Crop"</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {crops.map((crop, index) => (
                    <div key={`${crop.aspectRatioName}-${index}`} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={URL.createObjectURL(crop.blob)}
                          alt={`Crop ${crop.aspectRatioName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ASPECT_RATIOS.find(r => r.name === crop.aspectRatioName)?.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {crop.aspectRatio} folder
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCrop(crop.aspectRatioName)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {crops.length > 0 && (
              <span>{crops.length} version{crops.length !== 1 ? 's' : ''} ready to upload</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={crops.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Upload All ({crops.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 