'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomerStoryEditor from '@/components/CustomerStoryEditor'
import { useAuth } from '@/lib/auth-context'

export default function NewCustomerStoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { token } = useAuth()

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/customerstories', {
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
        throw new Error(responseData.error || 'Failed to create customer story')
      }

      router.push('/admin/customer-stories')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create customer story. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/customer-stories')
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Customer Story</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Create a compelling customer success story with stats and structured content sections.
        </p>
      </div>

      <CustomerStoryEditor onSave={handleSave} onCancel={handleCancel} isLoading={isLoading} />
    </div>
  )
} 