'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const { token, user } = useAuth()

  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [token])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: { name: string; description?: string }) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      setFormData({ name: '', description: '' })
      setShowCreateForm(false)
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Failed to create category')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Categories</h3>
          <p className="mt-1 text-sm text-gray-500">
            Organize your blog posts with categories.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showCreateForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {/* Create Category Form */}
      {showCreateForm && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-900">Create New Category</h2>
          </div>
          
          <form onSubmit={handleCreateCategory} className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="block w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors resize-none"
                    placeholder="Brief description (optional)"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Category
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <p>No categories yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Create your first category
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category: { id: string; name: string; description?: string; posts?: any[] }) => (
              <li key={category.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {category.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {category.posts?.length || 0} posts
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                      <span>{category.description || 'No description'}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit category"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete category"
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
    </div>
  )
} 