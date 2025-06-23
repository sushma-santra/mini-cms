import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { eventDetailSelect, eventApiSchema } from '@/lib/schemas/event'
import { z } from 'zod'

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: eventDetailSelect,
    })

    if (!event) {
      return errorResponse('Event not found', 404)
    }

    return successResponse(event, 'Event retrieved successfully')
  } catch (error) {
    console.error('Get event error:', error)
    return errorResponse('Internal server error')
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { id } = params

    const validatedData = eventApiSchema.partial().parse(body)

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) {
      return errorResponse('Event not found', 404)
    }

    if (user.role !== 'ADMIN' && event.authorId !== user.id) {
      return errorResponse('Access denied', 403)
    }

    const { start_date, end_date, ...restOfData } = validatedData

    const eventData: any = { ...restOfData }
    if (start_date) eventData.start_date = new Date(start_date)
    if (end_date) eventData.end_date = new Date(end_date)

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: eventData,
      select: eventDetailSelect,
    })

    return successResponse(updatedEvent, 'Event updated successfully')
  } catch (error) {
    console.error('Update event error:', error)
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid data', 400, { details: error.errors })
    }
    return errorResponse('Failed to update event')
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const { id } = params

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) {
      return errorResponse('Event not found', 404)
    }

    if (user.role !== 'ADMIN' && event.authorId !== user.id) {
      return errorResponse('Access denied', 403)
    }

    await prisma.event.delete({ where: { id } })

    return successResponse({}, 'Event deleted successfully')
  } catch (error) {
    console.error('Delete event error:', error)
    return errorResponse('Failed to delete event')
  }
} 