'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import CustomerStoryEditor from '@/components/CustomerStoryEditor'
import { useAuth } from '@/lib/auth-context'

export default function EditCustomerStoryPage() {
  const [customerStory, setCustomerStory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const customerStoryId = params.id as string

  useEffect(() => {
    if (token && customerStoryId) {
      fetchCustomerStory()
    }
  }, [token, customerStoryId])

  const fetchCustomerStory = async () => {
    try {
      const response = await fetch(`/api/customerstories/${customerStoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch customer story')
      }

      const data = await response.json()
      setCustomerStory(data)
    } catch (error) {
      console.error('Error fetching customer story:', error)
      alert('Failed to load customer story. Redirecting to customer stories list.')
      router.push('/admin/customer-stories')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customerstories/${customerStoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer story')
      }

      router.push('/admin/customer-stories')
    } catch (error) {
      console.error('Error updating customer story:', error)
      alert('Failed to update customer story. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/customer-stories')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading customer story...</div>
      </div>
    )
  }

  if (!customerStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Customer story not found</div>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Customer Story</h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Update your customer story details below.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/customer-stories')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Customer Stories
          </button>
        </div>
      </div>

      <CustomerStoryEditor 
        initialData={customerStory} 
        onSave={handleSave} 
        onCancel={handleCancel}
        isLoading={isLoading} 
      />
    </div>
  )
} 