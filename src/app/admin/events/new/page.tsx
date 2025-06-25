'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EventEditor from '@/components/EventEditor'
import { useAuth } from '@/lib/auth-context'

export default function NewEventPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { token } = useAuth()

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.details) {
          // If we have validation errors, show them
          const errorMessage = Array.isArray(responseData.details)
            ? responseData.details.map((err: any) => err.message).join('\n')
            : responseData.details
          throw new Error(errorMessage)
        }
        throw new Error(responseData.error || 'Failed to create event')
      }

      router.push('/admin/events')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/events')
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Event</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Add a new event to the system, including details, dates, and location.
        </p>
      </div>

      <EventEditor onSave={handleSave} onCancel={handleCancel} isLoading={isLoading} />
    </div>
  )
} 