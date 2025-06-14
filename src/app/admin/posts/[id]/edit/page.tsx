'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import PostEditor from '@/components/PostEditor'
import { useAuth } from '@/lib/auth-context'

export default function EditPostPage() {
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const postId = params.id as string

  useEffect(() => {
    if (token && postId) {
      fetchPost()
    }
  }, [token, postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }

      const data = await response.json()
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Failed to load post. Redirecting to posts list.')
      router.push('/admin/posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update post')
      }

      router.push('/admin/posts')
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading post...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Post not found</div>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Post</h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Update your blog post details below.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/posts')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Posts
          </button>
        </div>
      </div>

      <PostEditor 
        initialData={post} 
        onSave={handleSave} 
        isLoading={isLoading} 
      />
    </div>
  )
} 