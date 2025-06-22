'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-context'
import MultipleImageUploader, { UploadedImage } from './MultipleImageUploader'
import ClientLogoUploader, { ClientLogo } from './ClientLogoUploader'

// Import ReactQuill with simple configuration
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
    <span className="text-gray-500">Loading editor...</span>
  </div>
})

// Import styles outside of dynamic import
import 'react-quill/dist/quill.snow.css'

interface StatItem {
  label: string
  value: string
  id: string
}

interface ContentSection {
  title: string
  description: string
  id: string
}

interface CustomerStoryEditorProps {
  initialData?: any
  onSave?: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

// Solutions selector component
const SolutionsSelector = ({ selectedSolutions, onSolutionsChange }: { 
  selectedSolutions: string[], 
  onSolutionsChange: (solutions: string[]) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const solutionOptions = [
    { value: 'TEAM', label: 'Team' },
    { value: 'BROADCASTERS_AND_OTT_PLATFORMS', label: 'Broadcasters & OTT Platforms' },
    { value: 'PUBLISHERS', label: 'Publishers' },
    { value: 'GAMING_OPERATORS', label: 'Gaming Operators' },
    { value: 'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION', label: 'Video Technology & Automated Content Creation' },
    { value: 'DIGITAL_PLATFORMS', label: 'Digital Platforms' },
    { value: 'FAN_DATA_AND_CRM_CONSULTING', label: 'Fan Data & CRM Consulting' },
    { value: 'MARKETING_AND_COMMUNITY', label: 'Marketing & Community' },
    { value: 'GAMING_AND_FAN_LOYALTY', label: 'Gaming & Fan Loyalty' },
    { value: 'MANAGEMENT', label: 'Management' },
    { value: 'VIDEO_PRODUCTION', label: 'Video Production' },
    { value: 'SPORTS_DATA_SOLUTIONS', label: 'Sports Data Solutions' }
  ]

  const toggleSolution = (solutionValue: string) => {
    if (selectedSolutions.includes(solutionValue)) {
      onSolutionsChange(selectedSolutions.filter(s => s !== solutionValue))
    } else {
      onSolutionsChange([...selectedSolutions, solutionValue])
    }
  }

  const removeSolution = (solutionValue: string) => {
    onSolutionsChange(selectedSolutions.filter(s => s !== solutionValue))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Solutions (Multi-select)
      </label>
      
      {/* Selected solutions display */}
      {selectedSolutions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSolutions.map(solutionValue => {
            const solution = solutionOptions.find(opt => opt.value === solutionValue)
            return (
              <span
                key={solutionValue}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {solution?.label || solutionValue}
                <button
                  type="button"
                  onClick={() => removeSolution(solutionValue)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-200 focus:text-indigo-500"
                >
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <span className="block truncate text-gray-500">
            {selectedSolutions.length === 0 
              ? 'Select solutions...' 
              : `${selectedSolutions.length} solution${selectedSolutions.length === 1 ? '' : 's'} selected`
            }
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {solutionOptions.map((option) => {
              const isSelected = selectedSolutions.includes(option.value)
              return (
                <div
                  key={option.value}
                  onClick={() => toggleSolution(option.value)}
                  className={`cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-indigo-50 transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="text-indigo-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerStoryEditor({ initialData, onSave, onCancel, isLoading }: CustomerStoryEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(() => {
    if (initialData?.date) {
      return new Date(initialData.date).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [caption, setCaption] = useState(initialData?.caption || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState(initialData?.status || 'DRAFT')
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '')
  const [externalLink, setExternalLink] = useState(initialData?.externalLink || '')
  const [industry, setIndustry] = useState(initialData?.industry || 'TEAM')
  const [solutions, setSolutions] = useState<string[]>(initialData?.solutions || [])
  const [images, setImages] = useState<UploadedImage[]>(() => {
    const initialImages: UploadedImage[] = []
    
    // Add any existing images from mediaGallery
    if (initialData?.mediaGallery && Array.isArray(initialData.mediaGallery)) {
      initialData.mediaGallery.forEach((img: any, index: number) => {
        initialImages.push({
          id: img.id || `existing-img-${index}`,
          url: img.url,
          aspectRatio: img.aspectRatio || 'free',
          baseFilename: img.baseFilename || undefined,
          originalUrl: img.originalUrl || undefined,
          isExisting: true
        })
      })
    }
    
    return initialImages
  })

  // Client logos state
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(() => {
    if (initialData?.clientLogos && Array.isArray(initialData.clientLogos)) {
      return initialData.clientLogos.map((logo: any, index: number) => ({
        id: logo.id || `logo-${index}`,
        url: logo.url,
        name: logo.name || 'Client Logo',
        isExisting: true
      }))
    }
    return []
  })

  // Stats section state
  const [stats, setStats] = useState<StatItem[]>(() => {
    if (initialData?.stats && Array.isArray(initialData.stats)) {
      return initialData.stats.map((stat: any, index: number) => ({
        ...stat,
        id: stat.id || `stat-${index}`
      }))
    }
    return [{ label: '', value: '', id: 'stat-0' }]
  })

  // Content sections state
  const [contentSections, setContentSections] = useState<ContentSection[]>(() => {
    const initialSections = initialData?.contentSections && Array.isArray(initialData.contentSections)
      ? initialData.contentSections.map((section: any, index: number) => ({
          title: section.title || '',
          description: section.description || '',
          id: section.id || `section-${index}`
        }))
      : [{ title: '', description: '', id: 'section-0' }]
    return initialSections
  })

  const { token } = useAuth()

  // Generate slug from title
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/([a-z0-9])\.([a-z0-9])/g, '$1$2')
      .replace(/\./g, '-')
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim()
  }

  // Update slug when title changes, but only if slug hasn't been manually edited
  useEffect(() => {
    if (!initialData?.slug || slug === generateSlugFromTitle(title)) {
      setSlug(generateSlugFromTitle(title))
    }
  }, [title, initialData?.slug])

  // Stats management
  const addStat = () => {
    const newStat = { label: '', value: '', id: `stat-${Date.now()}` }
    setStats([...stats, newStat])
  }

  const updateStat = (id: string, field: 'label' | 'value', value: string) => {
    setStats(stats.map(stat => 
      stat.id === id ? { ...stat, [field]: value } : stat
    ))
  }

  const removeStat = (id: string) => {
    if (stats.length > 1) {
      setStats(stats.filter(stat => stat.id !== id))
    }
  }

  // Content sections management
  const addContentSection = () => {
    const newId = `section-${Date.now()}`
    setContentSections(prev => [...prev, { title: '', description: '', id: newId }])
  }

  const updateContentSection = (id: string, field: 'title' | 'description', value: string) => {
    setContentSections(prev => {
      const newSections = prev.map(section => {
        if (section.id === id) {
          return { ...section, [field]: value }
        }
        return section
      })
      return newSections
    })
  }

  const removeContentSection = (id: string) => {
    if (contentSections.length > 1) {
      setContentSections(prev => prev.filter(section => section.id !== id))
    }
  }

  // Define Quill modules outside of component
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'script', 'indent', 'direction', 'size',
    'color', 'background', 'font', 'align', 'link', 'image', 'video'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!title.trim()) {
      alert('Please enter a customer story title.')
      return
    }

    // Validate that either content sections or external link is provided
    const validContentSections = contentSections.filter(section => 
      section.title.trim() && section.description.trim()
    )
    
    if (!validContentSections.length && !externalLink.trim()) {
      alert('Please either add content sections or provide an external link.')
      return
    }

    // Validate stats (remove empty ones)
    const validStats = stats.filter(stat => stat.label.trim() && stat.value.trim())
    
    // Filter out invalid or empty images
    const validImages = images.filter(img => img.url && img.url.trim() !== '')
    
    // Filter out invalid or empty client logos
    const validClientLogos = clientLogos.filter(logo => logo.url && logo.url.trim() !== '')
    
    const data = {
      title,
      slug,
      date: new Date(date).toISOString(),
      caption,
      description,
      status,
      externalLink: externalLink.trim() || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      mediaGallery: validImages.map(img => ({
        url: img.url,
        aspectRatio: img.aspectRatio,
        baseFilename: img.baseFilename,
        originalUrl: img.originalUrl,
        isExisting: img.isExisting || false
      })),
      clientLogos: validClientLogos.map(logo => ({
        url: logo.url,
        name: logo.name,
        isExisting: logo.isExisting || false
      })),
      stats: validStats.map(({ id, ...stat }) => stat), // Remove IDs for API
      contentSections: validContentSections.map(({ id, ...section }) => section), // Remove IDs for API
      industry,
      solutions,
    }

    if (onSave) {
      try {
        await onSave(data)
      } catch (error) {
        console.error('Save failed:', error)
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {initialData ? 'Edit Customer Story' : 'Create New Customer Story'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {initialData ? 'Update your customer story content and settings.' : 'Create a compelling customer success story.'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Status:
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-40 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Title Section */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
              Story Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="Enter an engaging customer story title"
              required
            />
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              URL Slug
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))}
                className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                placeholder="custom-url-slug"
              />
              <button
                type="button"
                onClick={() => setSlug(generateSlugFromTitle(title))}
                className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
                title="Reset to auto-generated slug"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Customize the URL slug or leave empty to auto-generate from title
            </p>
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Story Date *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              required
            />
          </div>

          {/* Caption Field */}
          <div className="space-y-2">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="Short caption for your customer story (optional)"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <p className="text-sm text-gray-500">Brief description of the customer story (optional)</p>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="Brief description of the customer story (optional)"
            />
          </div>

          {/* Media Gallery Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Media Gallery</h3>
              <MultipleImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>
          </div>

          {/* Client Logos Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Client Logos</h3>
                <p className="text-sm text-gray-500 mt-1">Upload client logos to showcase partnerships and collaborations</p>
              </div>
              <ClientLogoUploader
                logos={clientLogos}
                onLogosChange={setClientLogos}
                maxLogos={8}
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Stats Section
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Add key metrics and achievements from this customer story</p>
                </div>
                <button
                  type="button"
                  onClick={addStat}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Stat
                </button>
              </div>
              
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div key={stat.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(stat.id, 'label', e.target.value)}
                        placeholder="Label (e.g., Revenue Growth)"
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(stat.id, 'value', e.target.value)}
                        placeholder="Value (e.g., 150%)"
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1"
                      />
                    </div>
                    {stats.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStat(stat.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Remove stat"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* External Link Field */}
          <div className="space-y-2">
            <label htmlFor="externalLink" className="block text-sm font-medium text-gray-700">
              External Link
            </label>
            <input
              id="externalLink"
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="https://example.com/customer-story"
            />
            <p className="text-xs text-gray-500">
              If provided, this link will be used instead of content sections
            </p>
          </div>

          {/* Content Sections */}
          {!externalLink && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Content Sections</h3>
                <button
                  type="button"
                  onClick={addContentSection}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Section
                </button>
              </div>
              
              <div className="space-y-6">
                {contentSections.map((section, index) => (
                  <div key={section.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Section {index + 1}</h4>
                      {contentSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContentSection(section.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Remove section"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateContentSection(section.id, 'title', e.target.value)}
                          placeholder="Section title (e.g., The Challenge)"
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1"
                        />
                      </div>
                      
                      <div className="min-h-[200px] bg-white">
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <ReactQuill
                            theme="snow"
                            value={section.description || ''}
                            onChange={(value) => updateContentSection(section.id, 'description', value)}
                            modules={quillModules}
                            formats={quillFormats}
                            className="bg-white"
                            placeholder="Section content..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Section */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Settings</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                    SEO Title
                  </label>
                  <input
                    id="seoTitle"
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                    placeholder="SEO optimized title for search engines"
                  />
                  <p className="text-xs text-gray-500">Recommended: 50-60 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    SEO Description
                  </label>
                  <textarea
                    id="seoDescription"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={4}
                    className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors resize-none"
                    placeholder="Brief description that appears in search results"
                  />
                  <p className="text-xs text-gray-500">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Industry and Solutions */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Industry and Solutions</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                  >
                    <option value="TEAM">Team</option>
                    <option value="BROADCASTERS_AND_OTT_PLATFORMS">Broadcasters & OTT Platforms</option>
                    <option value="PUBLISHERS">Publishers</option>
                    <option value="GAMING_OPERATORS">Gaming Operators</option>
                    <option value="VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION">Video Technology & Automated Content Creation</option>
                    <option value="DIGITAL_PLATFORMS">Digital Platforms</option>
                    <option value="FAN_DATA_AND_CRM_CONSULTING">Fan Data & CRM Consulting</option>
                    <option value="MARKETING_AND_COMMUNITY">Marketing & Community</option>
                    <option value="GAMING_AND_FAN_LOYALTY">Gaming & Fan Loyalty</option>
                    <option value="MANAGEMENT">Management</option>
                    <option value="VIDEO_PRODUCTION">Video Production</option>
                    <option value="SPORTS_DATA_SOLUTIONS">Sports Data Solutions</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <SolutionsSelector
                    selectedSolutions={solutions}
                    onSolutionsChange={setSolutions}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Customer Story'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 