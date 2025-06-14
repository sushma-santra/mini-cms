'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/auth-context'
import MultipleImageUploader, { UploadedImage } from './MultipleImageUploader'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
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
  isLoading?: boolean
}

export default function PostEditor({ initialData, onSave, isLoading }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [status, setStatus] = useState(initialData?.status || 'DRAFT')
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '')
  const [images, setImages] = useState<UploadedImage[]>(() => {
    const initialImages: UploadedImage[] = []
    
    // Add featured image if exists
    if (initialData?.featuredImage) {
      initialImages.push({
        id: 'featured-img',
        url: initialData.featuredImage,
        aspectRatio: 'free'
      })
    }
    
    // Add any existing images
    if (initialData?.images && Array.isArray(initialData.images)) {
      initialData.images.forEach((img: any, index: number) => {
        initialImages.push({
          id: `img-${index}`,
          url: img.url,
          aspectRatio: img.aspectRatio || 'free'
        })
      })
    }
    
    return initialImages
  })
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [categories, setCategories] = useState([])
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
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // ReactQuill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent',
    'color', 'background', 'align', 'link', 'image'
  ]

  // HTML formatting function
  const formatHTML = () => {
    if (!content) return
    
    try {
      // Simple HTML formatting (basic indentation)
      let formatted = content
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
      
      setContent(formattedLines.join('\n'))
    } catch (error) {
      console.error('Error formatting HTML:', error)
    }
  }

  // Insert HTML snippet
  const insertHTMLSnippet = (snippet: string) => {
    setContent((prev: string) => prev + '\n' + snippet)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      title,
      content,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      featuredImage: images.length > 0 ? images[0].url : undefined, // Keep first image as featured for backward compatibility
      images: images.map(img => ({
        url: img.url,
        aspectRatio: img.aspectRatio
      })),
      categoryId: categoryId || undefined,
    }

    if (onSave) {
      await onSave(data)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            {initialData ? 'Edit Post' : 'Create New Post'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {initialData ? 'Update your blog post content and settings.' : 'Create engaging content for your blog.'}
          </p>
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

          {/* Images Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Media Gallery</h3>
              <MultipleImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Content *
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Write your post content using the visual editor or HTML mode.</p>
                </div>
                <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setEditorMode('visual')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      editorMode === 'visual'
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Visual Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('html')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      editorMode === 'html'
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    HTML Code
                  </button>
                </div>
              </div>

              {editorMode === 'visual' ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white"
                    placeholder="Start writing your amazing content here..."
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* HTML Editor Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-t-lg">
                    <button
                      type="button"
                      onClick={formatHTML}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Format HTML"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-9-3-9h2l2 6 2-6h2l-3 9 3 9h-2l-2-6-2 6H7z" />
                      </svg>
                      Format
                    </button>
                    
                    <div className="h-5 w-px bg-gray-300"></div>
                    
                    <span className="text-xs text-gray-600 font-medium">Quick Insert:</span>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<div class="container">\n  \n</div>')}
                      className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Insert Container Div"
                    >
                      Container
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<img src="" alt="" class="w-full h-auto rounded-lg" />')}
                      className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Insert Image"
                    >
                      Image
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<a href="#" class="text-blue-600 hover:text-blue-800 underline"></a>')}
                      className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Insert Link"
                    >
                      Link
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">\n  \n</blockquote>')}
                      className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Insert Blockquote"
                    >
                      Quote
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => insertHTMLSnippet('<pre><code class="language-javascript">\n// Your code here\n</code></pre>')}
                      className="px-3 py-2 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      title="Insert Code Block"
                    >
                      Code
                    </button>
                  </div>
                  
                  <div className="border border-gray-300 rounded-b-lg overflow-hidden">
                    <Editor
                      height="400px"
                      defaultLanguage="html"
                      value={content}
                      onChange={(value) => setContent(value || '')}
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
                        padding: { top: 16, bottom: 16 },
                      }}
                    />
                  </div>
                </div>
              )}
              
              {editorMode === 'html' && (
                <div className="mt-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-800">HTML Editor Mode</p>
                      <p className="text-blue-700 mt-1">
                        You're editing raw HTML. Use proper HTML tags and ensure your code is well-formed. 
                        Switch to Visual mode to see the rendered preview.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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

          {/* Post Settings */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Post Settings</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Publication Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                  >
                    <option value="DRAFT">Draft - Save for later</option>
                    <option value="PUBLISHED">Published - Make live</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-colors"
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 