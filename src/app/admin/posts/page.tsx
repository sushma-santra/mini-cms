'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface Post {
  id: string
  title: string
  status: 'DRAFT' | 'PUBLISHED'
  updatedAt: string
  author: {
    name: string
    email: string
  }
}

interface ApiResponse {
  success: boolean
  message: string
  data: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    status: string | null
    search: string | null
    role: string
  }
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      fetchPosts()
    }
  }, [token])

  const fetchPosts = async (showToast = false) => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setPosts(data.data)
        setPagination(data.pagination)
        if (showToast && data.message) {
          toast.success(data.message)
        }
      } else {
        if (showToast) {
          toast.error(data.message || 'Failed to fetch posts')
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (showToast) {
        toast.error('Failed to fetch posts')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Post deleted successfully')
        fetchPosts(true) // Refresh the list and show toast
      } else {
        toast.error(data.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Posts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your blog posts. Total: {pagination.total}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <p>No posts yet.</p>
            <Link
              href="/admin/posts/new"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Create your first post
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {post.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                      <span>{post.author?.name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete post"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {posts.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchPosts()}
              disabled={!pagination.hasPrev}
              className={`px-3 py-1 text-sm rounded-md ${
                pagination.hasPrev
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => fetchPosts()}
              disabled={!pagination.hasNext}
              className={`px-3 py-1 text-sm rounded-md ${
                pagination.hasNext
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 