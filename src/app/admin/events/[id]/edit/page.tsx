'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import EventEditor from '@/components/EventEditor'
import { useAuth } from '@/lib/auth-context'

export default function EditEventPage() {
  const [initialData, setInitialData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { token } = useAuth()

  useEffect(() => {
    if (id && token) {
      fetchEventData()
    }
  }, [id, token])

  const fetchEventData = async () => {
    setIsFetching(true)
    try {
      const response = await fetch(`/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch event data')
      const data = await response.json()
      setInitialData(data.data)
    } catch (error) {
      console.error(error)
      alert('Failed to load event data.')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update event')
      }
      
      router.push('/admin/events')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/events')
  }

  if (isFetching) {
    return <div>Loading...</div>
  }

  if (!initialData) {
    return <div>Event not found.</div>
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Event</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Update the event details, dates, and location.
        </p>
      </div>
      <EventEditor
        initialData={initialData}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  )
} 