import { NextResponse } from 'next/server'

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination: Partial<PaginationData>
  filters: Record<string, unknown>
}

export function createPagination(
  page: number,
  limit: number,
  total: number
): PaginationData {
  const pages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  }
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  pagination: Partial<PaginationData> = {},
  filters: Record<string, unknown> = {}
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    pagination,
    filters
  }
  return NextResponse.json(response)
}

export function errorResponse(
  message: string,
  status = 500,
  filters: Record<string, unknown> = {}
): NextResponse {
  const response: ApiResponse<[]> = {
    success: false,
    message: `Failed: ${message}`,
    data: [],
    pagination: {},
    filters
  }
  return NextResponse.json(response, { status })
} 