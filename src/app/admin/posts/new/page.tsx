'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PostEditor from '@/components/PostEditor'
import { useAuth } from '@/lib/auth-context'

export default function NewPostPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { token } = useAuth()

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      router.push('/admin/posts')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Post</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Fill in the details below to create a new blog post.
        </p>
      </div>

      <PostEditor onSave={handleSave} isLoading={isLoading} />
    </div>
  )
} 