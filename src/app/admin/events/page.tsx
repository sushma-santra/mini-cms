'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'react-hot-toast'

interface Event {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  venue: string
  city: string
  country: string
  status: 'DRAFT' | 'PUBLISHED'
  author: {
    name: string
    email: string
  }
}

interface ApiResponse {
  success: boolean
  message: string
  data: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: Record<string, unknown>
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL')
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
      fetchEvents()
    }
  }, [token])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchEvents(true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Status filter effect
  useEffect(() => {
    fetchEvents(true)
  }, [statusFilter])

  const fetchEvents = async (showToast = false) => {
    try {
      let url = '/api/events?'
      if (searchTerm.length >= 3) {
        url += `search=${encodeURIComponent(searchTerm)}&`
      }
      if (statusFilter !== 'ALL') {
        url += `status=${statusFilter}&`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setEvents(data.data)
        setPagination(data.pagination)
      } else {
        if (showToast) {
          toast.error(data.message || 'Failed to fetch events')
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      if (showToast) {
        toast.error('Failed to fetch events')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Event deleted successfully')
        fetchEvents() // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Events</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your events and conferences.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Event
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'DRAFT' | 'PUBLISHED')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <p>No events yet.</p>
            <Link
              href="/admin/events/new"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Create your first event
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {event.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                      <span>{event.author?.name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      {event.venue && (
                        <>
                          <span>•</span>
                          <span>{event.venue}</span>
                        </>
                      )}
                      {event.city && event.country && (
                        <>
                          <span>•</span>
                          <span>{event.city}, {event.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit event"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete event"
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