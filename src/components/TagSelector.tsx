'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Tag {
  id: string
  name: string
  description?: string
}

interface TagSelectorProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  placeholder?: string
}

export default function TagSelector({ selectedTagIds, onTagsChange, placeholder = "Search or create tags..." }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isShowingCreateForm, setIsShowingCreateForm] = useState(false)
  const [newTagDescription, setNewTagDescription] = useState('')
  const { token, user } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all tags
  useEffect(() => {
    if (token) {
      fetchTags()
    }
  }, [token])

  // Filter tags based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      const available = allTags.filter(tag => !selectedTagIds.includes(tag.id))
      setFilteredTags(available)
    } else {
      const filtered = allTags.filter(tag => {
        const matchesName = tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDescription = tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const notSelected = !selectedTagIds.includes(tag.id)
        return (matchesName || matchesDescription) && notSelected
      })
      setFilteredTags(filtered)
    }
    setFocusedIndex(-1) // Reset focus when filtering
    setIsShowingCreateForm(false) // Reset create form when search changes
    setNewTagDescription('')
  }, [searchTerm, allTags, selectedTagIds])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        setIsShowingCreateForm(false)
        setNewTagDescription('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        return
      }
    }

    const totalOptions = filteredTags.length + (showCreateOption ? 1 : 0)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % totalOptions)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev <= 0 ? totalOptions - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredTags.length) {
          addTag(filteredTags[focusedIndex].id)
        } else if (focusedIndex === filteredTags.length && showCreateOption && canCreateTags) {
          if (isShowingCreateForm) {
            createNewTag()
          } else {
            setIsShowingCreateForm(true)
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        setIsShowingCreateForm(false)
        setNewTagDescription('')
        break
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      setAllTags(data.tags || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const createNewTag = async () => {
    if (!searchTerm.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: searchTerm.trim(),
          description: newTagDescription.trim() || `Tag: ${searchTerm.trim()}`
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create tag')
      }

      const newTag = await response.json()
      setAllTags(prev => [...prev, newTag])
      onTagsChange([...selectedTagIds, newTag.id])
      setSearchTerm('')
      setIsOpen(false)
      setIsShowingCreateForm(false)
      setNewTagDescription('')
    } catch (error: any) {
      console.error('Error creating tag:', error)
      alert(error.message || 'Failed to create tag. Admin privileges may be required.')
    } finally {
      setIsCreating(false)
    }
  }

  const addTag = (tagId: string) => {
    onTagsChange([...selectedTagIds, tagId])
    setSearchTerm('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId))
  }

  // Calculate derived values after all state is set
  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id))
  const hasExactMatch = filteredTags.some(tag => tag.name.toLowerCase() === searchTerm.toLowerCase())
  const showCreateOption = searchTerm.trim() && !hasExactMatch && !isCreating
  const canCreateTags = user?.role === 'ADMIN'

  return (
    <div className="space-y-3">
      {/* Force scrollbar visibility */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .force-scrollbar::-webkit-scrollbar {
            width: 12px !important;
            height: 12px !important;
          }
          .force-scrollbar::-webkit-scrollbar-track {
            background: #f3f4f6 !important;
            border-radius: 6px !important;
          }
          .force-scrollbar::-webkit-scrollbar-thumb {
            background: #6366f1 !important;
            border-radius: 6px !important;
            border: 2px solid #f3f4f6 !important;
          }
          .force-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4f46e5 !important;
          }
          .force-scrollbar {
            scrollbar-width: thin !important;
            scrollbar-color: #6366f1 #f3f4f6 !important;
          }
        `
      }} />
      <div className="relative" ref={dropdownRef}>
        <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[44px] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
             onClick={() => setIsOpen(true)}>
          {/* Selected tags as chips */}
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag.id)
                }}
                className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
              >
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : "Add more tags..."}
            className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400"
          />

          {/* Dropdown indicator */}
          <svg 
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div 
            className="force-scrollbar absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-2xl"
            style={{
              maxHeight: isShowingCreateForm ? '300px' : '200px', // Adjust height based on form visibility
              overflowY: 'scroll',
              overflowX: 'hidden',
              display: 'block'
            }}
          >
            {filteredTags.length === 0 && !showCreateOption ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                {searchTerm ? 'No tags found' : 'No more tags available'}
              </div>
            ) : (
              <div>
                {filteredTags.map((tag, index) => (
                  <div
                    key={tag.id}
                    onClick={() => addTag(tag.id)}
                    className={`block w-full px-4 py-3 text-left hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-200 last:border-b-0 ${
                      focusedIndex === index ? 'bg-blue-100' : ''
                    }`}
                    style={{ minHeight: '50px' }} // Reduced to fit more items
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="text-sm font-semibold text-gray-900 mb-1">{tag.name}</div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                          {tag.description || 'No description available'}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {showCreateOption && (
                  <div className="border-t-2 border-gray-300">
                    {!isShowingCreateForm ? (
                      <div
                        onClick={canCreateTags ? () => setIsShowingCreateForm(true) : undefined}
                        className={`block w-full px-4 py-3 text-left transition-colors ${
                          canCreateTags 
                            ? 'hover:bg-green-50 cursor-pointer' 
                            : 'cursor-not-allowed opacity-60'
                        } ${
                          focusedIndex === filteredTags.length ? 'bg-green-100' : ''
                        }`}
                        style={{ minHeight: '50px' }}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            canCreateTags ? 'bg-indigo-500' : 'bg-gray-400'
                          }`}>
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold mb-1 ${
                              canCreateTags ? 'text-indigo-600' : 'text-gray-500'
                            }`}>
                              Create "{searchTerm}"
                            </div>
                            <div className="text-xs text-gray-600">
                              {canCreateTags 
                                ? 'Click to add description and create' 
                                : 'Admin privileges required to create tags'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50">
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              Creating tag: "{searchTerm}"
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description (optional)
                            </label>
                            <textarea
                              value={newTagDescription}
                              onChange={(e) => setNewTagDescription(e.target.value)}
                              placeholder="e.g., Posts about cricket star Virat Kohli..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={createNewTag}
                              disabled={isCreating}
                              className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreating ? (
                                <div className="flex items-center justify-center">
                                  <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                                  </svg>
                                  Creating...
                                </div>
                              ) : (
                                'Create Tag'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setIsShowingCreateForm(false)
                                setNewTagDescription('')
                              }}
                              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
      {selectedTags.length > 0 && (
        <div className="text-xs text-gray-500">
          {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  )
} 