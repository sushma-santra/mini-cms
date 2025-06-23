'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Category {
  id: string
  name: string
  description?: string
}

interface CategorySelectorProps {
  selectedCategoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  placeholder?: string
}

export default function CategorySelector({ selectedCategoryId, onCategoryChange, placeholder = "Select a category..." }: CategorySelectorProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const { token } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all categories
  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [token])

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(allCategories)
    } else {
      const filtered = allCategories.filter(category => {
        const matchesName = category.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDescription = category.description?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesName || matchesDescription
      })
      setFilteredCategories(filtered)
    }
    setFocusedIndex(-1) // Reset focus when filtering
  }, [searchTerm, allCategories])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
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

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev + 1) % filteredCategories.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev <= 0 ? filteredCategories.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredCategories.length) {
          selectCategory(filteredCategories[focusedIndex].id)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setFocusedIndex(-1)
        break
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setAllCategories(data.data || [])
      } else {
        console.error('Error fetching categories:', data.message)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const selectCategory = (categoryId: string) => {
    onCategoryChange(categoryId)
    setSearchTerm('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const removeCategory = () => {
    onCategoryChange(null)
  }

  // Get the selected category object
  const selectedCategory = allCategories.find(cat => cat.id === selectedCategoryId)

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
          {/* Selected category as chip */}
          {selectedCategory && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {selectedCategory.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeCategory()
                }}
                className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
              >
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          )}

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={!selectedCategory ? placeholder : "Change category..."}
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

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto force-scrollbar">
            {filteredCategories.length > 0 ? (
              <div className="py-1">
                {filteredCategories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => selectCategory(category.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                      focusedIndex === index
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-grow truncate">{category.name}</span>
                    {category.id === selectedCategoryId && (
                      <svg className="h-4 w-4 text-indigo-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No categories found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}