'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getImageUrl } from '@/lib/image-utils-client'

export interface ClientLogo {
  id: string
  url: string
  name: string
  isExisting?: boolean
}

interface ClientLogoUploaderProps {
  logos: ClientLogo[]
  onLogosChange: (logos: ClientLogo[]) => void
  maxLogos?: number
}

export default function ClientLogoUploader({ 
  logos, 
  onLogosChange, 
  maxLogos = 10 
}: ClientLogoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const newFiles = Array.from(files).slice(0, maxLogos - logos.length)
    await uploadLogos(newFiles)
  }

  const uploadLogos = async (files: File[]) => {
    if (files.length === 0) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload/logos', {
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
      
      const newLogos: ClientLogo[] = result.uploads.map((upload: any, index: number) => ({
        id: `logo-${Date.now()}-${index}`,
        url: upload.url,
        name: upload.originalName || 'Client Logo',
        isExisting: false
      }))

      onLogosChange([...logos, ...newLogos])
    } catch (error) {
      console.error('Error uploading logos:', error)
      alert('Failed to upload client logos. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = (logoId: string) => {
    const updatedLogos = logos.filter(logo => logo.id !== logoId)
    onLogosChange(updatedLogos)
  }

  const updateLogoName = (logoId: string, newName: string) => {
    const updatedLogos = logos.map(logo => 
      logo.id === logoId ? { ...logo, name: newName } : logo
    )
    onLogosChange(updatedLogos)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
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
          <div className="mt-4">
            <label htmlFor="logo-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Add Client Logos
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                Drop logos here or click to browse
              </span>
              <span className="mt-1 block text-xs text-gray-400">
                PNG, JPG, SVG up to 5MB ({logos.length}/{maxLogos})
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="logo-upload"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={uploading || logos.length >= maxLogos}
            />
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <span className="text-sm text-indigo-600">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Logos Grid */}
      {logos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-50">
                <img
                  src={getImageUrl(logo.url)}
                  alt={logo.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              
              <div className="p-3">
                <input
                  type="text"
                  value={logo.name}
                  onChange={(e) => updateLogoName(logo.id, e.target.value)}
                  className="w-full text-sm border-none p-0 focus:ring-0 focus:outline-none bg-transparent"
                  placeholder="Client name"
                />
              </div>

              <button
                onClick={() => removeLogo(logo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove logo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {logos.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No client logos uploaded yet.</p>
          <p className="text-xs mt-1">Add client logos to showcase your partnerships.</p>
        </div>
      )}
    </div>
  )
} 