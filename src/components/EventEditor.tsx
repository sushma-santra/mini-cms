'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import MultipleImageUploader, { UploadedImage } from '@/components/MultipleImageUploader'
import { useFormValidation } from '@/hooks/useFormValidation'
import { eventValidationSchema } from '@/lib/schemas/content-validation'
import { FieldWrapper, FieldError } from './ui/FieldError'

interface EventEditorProps {
  initialData?: any
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

interface EventHighlight {
  title: string
  description: string
  id: string
}

export default function EventEditor({ initialData, onSave, onCancel, isLoading }: EventEditorProps) {
  // Form states
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [externalLink, setExternalLink] = useState(initialData?.external_link || '')
  const [country, setCountry] = useState(initialData?.country || '')
  const [state, setState] = useState(initialData?.state || '')
  const [city, setCity] = useState(initialData?.city || '')
  const [venue, setVenue] = useState(initialData?.venue || '')
  const [booth, setBooth] = useState(initialData?.booth || '')
  const [startDate, setStartDate] = useState<Date>(
    initialData?.start_date ? new Date(initialData.start_date) : new Date()
  )
  const [endDate, setEndDate] = useState<Date>(
    initialData?.end_date ? new Date(initialData.end_date) : new Date()
  )
  const [startTime, setStartTime] = useState(initialData?.start_time || '')
  const [endTime, setEndTime] = useState(initialData?.end_time || '')
  const [joinUsLink, setJoinUsLink] = useState(initialData?.join_us_link || '')
  const [eventMapEmbed, setEventMapEmbed] = useState(initialData?.event_map_embed || '')
  const [eventDetails, setEventDetails] = useState(initialData?.event_details || '')
  const [status, setStatus] = useState(initialData?.status || 'DRAFT')
  
  const [highlights, setHighlights] = useState<EventHighlight[]>(() => {
    if (initialData?.event_highlights && Array.isArray(initialData.event_highlights)) {
      return initialData.event_highlights.map((highlight: any, index: number) => ({
        ...highlight,
        id: highlight.id || `highlight-${index}`
      }))
    }
    return [{ title: '', description: '', id: 'highlight-0' }]
  })
  
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug)

  // Form validation
  const validation = useFormValidation({
    schema: eventValidationSchema,
    initialData
  })

  const [image, setImage] = useState<UploadedImage[]>(() => {
    const initialImages: UploadedImage[] = []
    
    // Add existing images if available (can be multiple)
    if (initialData?.images && Array.isArray(initialData.images)) {
      initialData.images.forEach((img: any, index: number) => {
        initialImages.push({
          id: img.id || `existing-img-${index}`,
          url: img.url,
          aspectRatio: img.aspectRatio || 'free',
          baseFilename: img.baseFilename || undefined,
          originalUrl: img.originalUrl || undefined,
          featured: img.featured || false,  // Preserve featured status
          isExisting: true
        })
      })
    }
    // Fallback for single image (legacy support)
    else if (initialData?.image) {
      initialImages.push({
        id: initialData.image.id || `existing-img-0`,
        url: initialData.image.url,
        aspectRatio: initialData.image.aspectRatio || 'free',
        baseFilename: initialData.image.baseFilename || undefined,
        originalUrl: initialData.image.originalUrl || undefined,
        featured: true,  // Single image is always featured
        isExisting: true
      })
    }
    
    // If no featured image is marked, set the first image as featured
    if (initialImages.length > 0 && !initialImages.some(img => img.featured)) {
      initialImages[0].featured = true
    }
    
    return initialImages
  })

  // Trigger validation when essential data changes (but not on initial mount)
  useEffect(() => {
    if (title.trim() || startDate || endDate) {
      const formData = getFormData()
      validation.validateForm(formData)
    }
  }, [title, startDate, endDate])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  };

  useEffect(() => {
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(title || ''))
    }
  }, [title, isSlugManuallyEdited])

  // Validation effect - trigger when key fields change
  useEffect(() => {
    // Trigger validation if we have essential fields
    if (title.trim() || startDate || endDate) {
      const formData = getFormData()
      validation.validateForm(formData)
    }
  }, [title, startDate, endDate, externalLink, country, state, city, venue, booth, startTime, endTime, joinUsLink, eventMapEmbed, eventDetails, highlights])

  // Add handleImagesChange function to properly manage featured status
  const handleImagesChange = (newImages: UploadedImage[]) => {
    // Ensure only one image is featured
    const featuredImage = newImages.find(img => img.featured)
    if (!featuredImage && newImages.length > 0) {
      // If no image is featured, mark the first one
      newImages[0].featured = true
    }
    setImage(newImages)
  }

  // Form data getter helper
  const getFormData = () => {
    // Ensure only one image is featured if there are multiple images
    let processedImages = [...image]
    if (processedImages.length > 0) {
      const featuredImages = processedImages.filter(img => img.featured)
      if (featuredImages.length > 1) {
        processedImages = processedImages.map(img => ({
          ...img,
          featured: img.id === featuredImages[0].id
        }))
      } else if (featuredImages.length === 0) {
        processedImages[0].featured = true
      }
    }

    // Filter out empty highlights
    const validHighlights = highlights.filter(highlight => 
      highlight.title.trim() && highlight.description.trim()
    )

    return {
      title: title.trim(),
      slug: slug.trim(),
      external_link: externalLink.trim() || undefined,
      country: country.trim() || undefined,
      state: state.trim() || undefined,
      city: city.trim() || undefined,
      venue: venue.trim() || undefined,
      booth: booth.trim() || undefined,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime.trim() || undefined,
      end_time: endTime.trim() || undefined,
      join_us_link: joinUsLink.trim() || undefined,
      event_map_embed: eventMapEmbed.trim() || undefined,
      event_details: eventDetails.trim() || undefined,
      status,
      images: processedImages,
      event_highlights: validHighlights.map(({ id, ...highlight }) => highlight)
    }
  }

  const addHighlight = () => {
    const newId = `highlight-${Date.now()}`
    setHighlights([...highlights, { title: '', description: '', id: newId }])
  }

  const removeHighlight = (id: string) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter(highlight => highlight.id !== id))
    }
  }

  const updateHighlight = (id: string, field: keyof EventHighlight, value: string) => {
    if (field === 'id') return // Don't allow id updates
    setHighlights(highlights.map(highlight => 
      highlight.id === id ? { ...highlight, [field]: value } : highlight
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formData = getFormData()
      
      // Validate the form data
      const validationResult = validation.validateForm(formData, true)
      
      if (!validationResult.isValid) {
        console.log('Validation errors:', validationResult.errors)
        return
      }

      await onSave(formData)
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    }
  }

  // Field change handlers with validation
  const handleTitleChange = (value: string) => {
    setTitle(value)
    validation.validateField('title', value.trim(), getFormData())
  }

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date)
      validation.validateField('start_date', date, getFormData())
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date)
      validation.validateField('end_date', date, getFormData())
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
            <div className="flex items-center space-x-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldWrapper 
                label="Title" 
                required={true}
                error={validation.getFieldError('title')}
              >
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 transition-colors ${
                    validation.hasFieldError('title') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder="Enter event title"
                />
              </FieldWrapper>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setIsSlugManuallyEdited(true)
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Slug is auto-generated from the title. You can customize it."
              />
              <p className="text-sm text-gray-500">
                Slug is auto-generated from the title. You can customize it.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="external_link" className="block text-sm font-medium text-gray-700">
                External Link
              </label>
              <input
                type="url"
                id="external_link"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/event"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                Venue
              </label>
              <input
                type="text"
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="booth" className="block text-sm font-medium text-gray-700">
                Booth
              </label>
              <input
                type="text"
                id="booth"
                value={booth}
                onChange={(e) => setBooth(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Date and Time Information */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Date and Time Information</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <FieldWrapper 
                label="Start Date" 
                required={true}
                error={validation.getFieldError('start_date')}
              >
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 transition-colors ${
                    validation.hasFieldError('start_date') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  dateFormat="MMMM d, yyyy"
                />
              </FieldWrapper>
            </div>
            <div>
              <FieldWrapper 
                label="End Date" 
                required={true}
                error={validation.getFieldError('end_date')}
              >
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 transition-colors ${
                    validation.hasFieldError('end_date') 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  dateFormat="MMMM d, yyyy"
                />
              </FieldWrapper>
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="start_time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="end_time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
          <div className="space-y-6">
            <div>
              <label htmlFor="join_us_link" className="block text-sm font-medium text-gray-700">
                Join Us Link
              </label>
              <input
                type="url"
                id="join_us_link"
                value={joinUsLink}
                onChange={(e) => setJoinUsLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/join"
              />
            </div>
            <div>
              <label htmlFor="event_details" className="block text-sm font-medium text-gray-700">
                Event Details
              </label>
              <textarea
                id="event_details"
                rows={4}
                value={eventDetails}
                onChange={(e) => setEventDetails(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional event details..."
              />
            </div>
            <div>
              <label htmlFor="event_map_embed" className="block text-sm font-medium text-gray-700">
                Event Map Embed
              </label>
              <textarea
                id="event_map_embed"
                rows={3}
                value={eventMapEmbed}
                onChange={(e) => setEventMapEmbed(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="<iframe>...</iframe> or map embed code"
              />
            </div>
          </div>
        </div>

        {/* Event Images */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Event Images</h4>
          <MultipleImageUploader
            images={image}
            onImagesChange={handleImagesChange}
          />
        </div>

        {/* Event Highlights */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Event Highlights</h4>
            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Highlight
            </button>
          </div>
          <div className="space-y-4">
            {highlights.map((highlight, index) => (
              <div key={highlight.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Highlight {index + 1}</h5>
                  {highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHighlight(highlight.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={highlight.title}
                      onChange={(e) => updateHighlight(highlight.id, 'title', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Highlight title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={highlight.description}
                      onChange={(e) => updateHighlight(highlight.id, 'description', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Highlight description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isLoading || !validation.isSubmittable
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isLoading || !validation.isSubmittable}
                     >
             {isLoading ? 'Saving...' : 'Save Event'}
           </button>
        </div>
      </div>
    </form>
  )
} 