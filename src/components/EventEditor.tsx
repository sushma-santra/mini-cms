'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import MultipleImageUploader, { UploadedImage } from '@/components/MultipleImageUploader'
import { baseEventSchema } from '@/lib/schemas/event'
import { zodResolver } from '@hookform/resolvers/zod'

type EventFormData = z.infer<typeof baseEventSchema>

interface EventEditorProps {
  initialData?: any
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

interface EventHighlight {
  title: string
  description: string
}

export default function EventEditor({ initialData, onSave, onCancel, isLoading }: EventEditorProps) {
  const [highlights, setHighlights] = useState<EventHighlight[]>(
    initialData?.event_highlights || []
  )
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug)

  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<EventFormData>({
    resolver: zodResolver(baseEventSchema),
    defaultValues: {
      ...initialData,
      slug: initialData?.slug || '',
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : new Date(),
      image: initialData?.image || undefined,
    },
  })

  const watchedTitle = watch('title')

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
      setValue('slug', generateSlug(watchedTitle || ''))
    }
  }, [watchedTitle, isSlugManuallyEdited, setValue])

  const watchedImage = watch('image')

  const [image, setImage] = useState<UploadedImage[]>(
    initialData?.image ? [initialData.image] : []
  )

  useEffect(() => {
    console.log('Image state changed:', image);
    setValue('image', image[0])
  }, [image, setValue])

  const addHighlight = () => {
    setHighlights([...highlights, { title: '', description: '' }])
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const updateHighlight = (index: number, field: keyof EventHighlight, value: string) => {
    const newHighlights = [...highlights]
    newHighlights[index] = { ...newHighlights[index], [field]: value }
    setHighlights(newHighlights)
  }

  const onSubmit = async (data: EventFormData) => {
    const eventData = {
      ...data,
      slug: data.slug || generateSlug(data.title),
      event_highlights: highlights,
      image: image[0] || null,
    }
    await onSave(eventData)
  }

  const slugRegister = register('slug');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register('status')}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                {...slugRegister}
                onChange={(e) => {
                  slugRegister.onChange(e);
                  setIsSlugManuallyEdited(true);
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Slug is auto-generated from the title. You can customize it.
              </p>
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="external_link" className="block text-sm font-medium text-gray-700">
                External Link
              </label>
              <input
                type="url"
                id="external_link"
                {...register('external_link')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.external_link && <p className="mt-2 text-sm text-red-600">{errors.external_link.message}</p>}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
              <input type="text" id="country" {...register('country')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.country && <p className="mt-2 text-sm text-red-600">{errors.country.message}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <input type="text" id="state" {...register('state')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>}
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" id="city" {...register('city')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">Venue</label>
              <input type="text" id="venue" {...register('venue')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.venue && <p className="mt-2 text-sm text-red-600">{errors.venue.message}</p>}
            </div>
            <div>
              <label htmlFor="booth" className="block text-sm font-medium text-gray-700">Booth</label>
              <input type="text" id="booth" {...register('booth')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.booth && <p className="mt-2 text-sm text-red-600">{errors.booth.message}</p>}
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Date and Time</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <Controller
                control={control}
                name="start_date"
                render={({ field }) => <DatePicker selected={field.value} onChange={(date: Date | null) => field.onChange(date)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />}
              />
              {errors.start_date && <p className="mt-2 text-sm text-red-600">{errors.start_date.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date *</label>
              <Controller
                control={control}
                name="end_date"
                render={({ field }) => <DatePicker selected={field.value} onChange={(date: Date | null) => field.onChange(date)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />}
              />
              {errors.end_date && <p className="mt-2 text-sm text-red-600">{errors.end_date.message as string}</p>}
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="text" id="start_time" {...register('start_time')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 09:00 AM" />
              {errors.start_time && <p className="mt-2 text-sm text-red-600">{errors.start_time.message}</p>}
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="text" id="end_time" {...register('end_time')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 05:00 PM" />
              {errors.end_time && <p className="mt-2 text-sm text-red-600">{errors.end_time.message}</p>}
            </div>
          </div>
        </div>

        {/* Event Image */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Event Image</h4>
          <MultipleImageUploader
            images={image}
            onImagesChange={setImage}
            maxImages={1}
          />
          {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image.message as string}</p>}
        </div>

        {/* Event Highlights */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Event Highlights</h4>
            <button type="button" onClick={addHighlight} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Highlight
            </button>
          </div>
          <div className="space-y-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h5 className="text-sm font-medium text-gray-900">Highlight {index + 1}</h5>
                  <button type="button" onClick={() => removeHighlight(index)} className="text-red-600 hover:text-red-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" value={highlight.title} onChange={(e) => updateHighlight(index, 'title', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={highlight.description} onChange={(e) => updateHighlight(index, 'description', e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="join_us_link" className="block text-sm font-medium text-gray-700">Join Us Link</label>
              <input type="url" id="join_us_link" {...register('join_us_link')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="https://example.com/join" />
              {errors.join_us_link && <p className="mt-2 text-sm text-red-600">{errors.join_us_link.message}</p>}
            </div>
            <div>
              <label htmlFor="event_map_embed" className="block text-sm font-medium text-gray-700">Event Map Embed</label>
              <textarea id="event_map_embed" {...register('event_map_embed')} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder='<iframe src="..."></iframe>'></textarea>
              {errors.event_map_embed && <p className="mt-2 text-sm text-red-600">{errors.event_map_embed.message}</p>}
            </div>
            <div>
              <label htmlFor="event_details" className="block text-sm font-medium text-gray-700">Event Details</label>
              <textarea id="event_details" {...register('event_details')} rows={6} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Provide any additional details about the event."></textarea>
              {errors.event_details && <p className="mt-2 text-sm text-red-600">{errors.event_details.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  )
} 