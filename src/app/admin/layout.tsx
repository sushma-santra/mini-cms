'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  FolderIcon,
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  TagIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { classNames } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: pathname === '/admin' },
    { name: 'Posts', href: '/admin/posts', icon: DocumentTextIcon, current: pathname.startsWith('/admin/posts') },
    { name: 'Customer Stories', href: '/admin/customer-stories', icon: BookOpenIcon, current: pathname.startsWith('/admin/customer-stories') },
    { name: 'Categories', href: '/admin/categories', icon: FolderIcon, current: pathname.startsWith('/admin/categories'), adminOnly: true },
    { name: 'Tags', href: '/admin/tags', icon: TagIcon, current: pathname.startsWith('/admin/tags'), adminOnly: true },
    { name: 'Events', href: '/admin/events', icon: CalendarIcon, current: pathname.startsWith('/admin/events'), adminOnly: true },
    { name: 'Users', href: '/admin/users', icon: UsersIcon, current: pathname.startsWith('/admin/users'), adminOnly: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <img
              src="/assets/images/logo.svg"
              alt="SI CMS Logo"
              className="h-8 w-auto"
            />
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              (!item.adminOnly || user?.role === 'ADMIN') && (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            ))}
          </nav>
          {/* User section */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <div className="flex flex-col">
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    user?.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-3 text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 