'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-context'
import MultipleImageUploader, { UploadedImage } from './MultipleImageUploader'
import TagSelector from './TagSelector'
import CategorySelector from './CategorySelector'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
    <span className="text-gray-500">Loading editor...</span>
  </div>
})

// Import styles outside of dynamic import
import 'react-quill/dist/quill.snow.css'

// Dynamically import Monaco Editor for HTML editing
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
    <span className="text-gray-500">Loading HTML Editor...</span>
  </div>
})

interface PostEditorProps {
  initialData?: any
  onSave?: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function PostEditor({ initialData, onSave, onCancel, isLoading }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [fullText, setFullText] = useState(initialData?.fullText || '')
  const [caption, setCaption] = useState(initialData?.caption || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [externalLinks, setExternalLinks] = useState(initialData?.externalLinks || '')
  const [status, setStatus] = useState(initialData?.status || 'DRAFT')
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '')
  const [images, setImages] = useState<UploadedImage[]>(() => {
    const initialImages: UploadedImage[] = []
    
    // Add any existing images first
    if (initialData?.images && Array.isArray(initialData.images)) {
      initialData.images.forEach((img: any, index: number) => {
        initialImages.push({
          id: img.id || `existing-img-${index}`,
          url: img.url,
          aspectRatio: img.aspectRatio || 'free',
          baseFilename: img.baseFilename || undefined,
          originalUrl: img.originalUrl || undefined,
          featured: img.featured || false,  // Preserve featured status
          isExisting: true
        })
      })
    }
    
    // If no featured image is marked, set the first image as featured
    if (initialImages.length > 0 && !initialImages.some(img => img.featured)) {
      initialImages[0].featured = true
    }
    
    return initialImages
  })
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [categories, setCategories] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags ? initialData.tags.map((tag: any) => tag.id) : []
  )
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual')
  const { token } = useAuth()

  // Fetch categories
  useEffect(() => {
    if (token) {
      fetchCategories()
    }
  }, [token])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      } else {
        console.error('Error fetching categories:', data.message)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // ReactQuill modules configuration for main content
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'script', 'indent', 'direction', 'size',
    'color', 'background', 'font', 'align', 'link', 'image', 'video'
  ]

  // Generate slug from title
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/([a-z0-9])\.([a-z0-9])/g, '$1$2')
      .replace(/\./g, '-')
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim()
  }

  // Update slug when title changes, but only if slug hasn't been manually edited
  useEffect(() => {
    if (!initialData?.slug || slug === generateSlugFromTitle(title)) {
      setSlug(generateSlugFromTitle(title))
    }
  }, [title, initialData?.slug])

  // HTML formatting function
  const formatHTML = () => {
    if (!fullText) return
    
    try {
      // Simple HTML formatting (basic indentation)
      let formatted = fullText
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/g, '')
      
      // Basic indentation
      const lines = formatted.split('\n')
      let indentLevel = 0
      const formattedLines = lines.map((line: string) => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        
        // Decrease indent for closing tags
        if (trimmed.startsWith('</') && !trimmed.includes('</br>') && !trimmed.includes('</img>')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const indentedLine = '  '.repeat(indentLevel) + trimmed
        
        // Increase indent for opening tags (but not self-closing)
        if (trimmed.includes('<') && !trimmed.includes('</') && 
            !trimmed.endsWith('/>') && !trimmed.includes('<br>') && 
            !trimmed.includes('<img') && !trimmed.includes('<input') &&
            !trimmed.includes('<meta') && !trimmed.includes('<link')) {
          indentLevel++
        }
        
        return indentedLine
      })
      
      setFullText(formattedLines.join('\n'))
    } catch (error) {
      console.error('Error formatting HTML:', error)
    }
  }

  // Insert HTML snippet
  const insertHTMLSnippet = (snippet: string) => {
    setFullText((prev: string) => prev + '\n' + snippet)
  }

  // Add handleImagesChange function to properly manage featured status
  const handleImagesChange = (newImages: UploadedImage[]) => {
    // Ensure only one image is featured
    const featuredImage = newImages.find(img => img.featured)
    if (!featuredImage && newImages.length > 0) {
      // If no image is featured, mark the first one
      newImages[0].featured = true
    }
    setImages(newImages)
  }

  // Update the handleSubmit function to properly handle images
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSave) return

    try {
      // Client-side validation
      if (!title.trim()) {
        alert('Please enter a post title.')
        return
      }

      // Validate that either content or external link is provided
      if (!fullText.trim() && !externalLinks.trim()) {
        alert('Please either add content or provide an external link.')
        return
      }

      // Ensure only one image is featured
      let processedImages = [...images]
      const featuredImages = processedImages.filter(img => img.featured)
      if (featuredImages.length > 1) {
        processedImages = processedImages.map(img => ({
          ...img,
          featured: img.id === featuredImages[0].id
        }))
      } else if (featuredImages.length === 0 && processedImages.length > 0) {
        processedImages[0].featured = true
      }

      // Prepare post data
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        fullText: fullText.trim() || undefined,
        caption: caption.trim(),
        description: description.trim(),
        externalLinks: externalLinks.trim() || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        status,
        categoryId: categoryId || undefined,
        tags: selectedTagIds,
        images: processedImages
      }

      

      await onSave(postData)
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post. Please try again.')
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onCancel) {
      onCancel()
    }
  }

  // Add the format function at the top of the file
  const formatCategoryName = (name: string): string => {
    return name.replace(/-/g, ' ')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {initialData ? 'Edit Post' : 'Create New Post'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {initialData ? 'Update your blog post content and settings.' : 'Create engaging content for your blog.'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Status:
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-40 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Title Section */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
              Post Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="Enter an engaging title for your post"
              required
            />
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              URL Slug
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))}
                className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                placeholder="custom-url-slug"
              />
              <button
                type="button"
                onClick={() => setSlug(generateSlugFromTitle(title))}
                className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
                title="Reset to auto-generated slug"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Customize the URL slug or leave empty to auto-generate from title
            </p>
          </div>

          {/* Caption Field */}
          <div className="space-y-2">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="Short caption for your post (optional)"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <p className="text-sm text-gray-500">Brief description of your post (optional)</p>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="Brief description of your post (optional)"
            />
          </div>

          {/* External Links Field */}
          <div className="space-y-2">
            <label htmlFor="externalLinks" className="block text-sm font-medium text-gray-700">
              External Link
            </label>
            <input
              id="externalLinks"
              type="url"
              value={externalLinks}
              onChange={(e) => setExternalLinks(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
              placeholder="https://example.com/article"
            />
            <p className="text-xs text-gray-500">
              If provided, this link will be used instead of content
            </p>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Media Gallery</h3>
              <MultipleImageUploader
                images={images}
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
            </div>
          </div>

          {/* Content Field */}
          {!externalLinks && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content *
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Main content of your post</p>
                </div>
                <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setEditorMode('visual')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      editorMode === 'visual'
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Visual Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('html')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      editorMode === 'html'
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    HTML Code
                  </button>
                </div>
              </div>

              {editorMode === 'visual' ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <ReactQuill
                    theme="snow"
                    value={fullText || ''}
                    onChange={setFullText}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    placeholder="Write your post content here..."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="400px"
                      defaultLanguage="html"
                      value={fullText}
                      onChange={(value) => setFullText(value || '')}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                        bracketPairColorization: { enabled: true },
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        folding: true,
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={formatHTML}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Format HTML
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<p></p>')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + Paragraph
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<h2></h2>')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + Heading
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<ul>\n  <li></li>\n</ul>')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + List
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<a href=""></a>')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + Link
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<blockquote>\n  <p></p>\n</blockquote>')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + Blockquote
                    </button>
                  </div>
                </div>
              )}
              
              {editorMode === 'html' && (
                <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex">
                    <svg className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-800">
                      <span className="font-medium">HTML Mode:</span> You can write HTML directly. Use the helper buttons above to insert common elements.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEO Section */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Settings</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                    SEO Title
                  </label>
                  <input
                    id="seoTitle"
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                    placeholder="SEO optimized title for search engines"
                  />
                  <p className="text-xs text-gray-500">Recommended: 50-60 characters</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    SEO Description
                  </label>
                  <textarea
                    id="seoDescription"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={4}
                    className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors resize-none"
                    placeholder="Brief description that appears in search results"
                  />
                  <p className="text-xs text-gray-500">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Category and Tags</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="block w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {formatCategoryName(category.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <TagSelector
                    selectedTagIds={selectedTagIds}
                    onTagsChange={setSelectedTagIds}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 