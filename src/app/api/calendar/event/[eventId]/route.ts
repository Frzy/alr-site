import { deleteCalendarEvent, getCalendarEvent, updateCalendarEvent } from '@/lib/calendar'
import { mapGoogleToServer } from '@/utils/calendar'

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } },
): Promise<Response> {
  let recurrenceEvent
  const { searchParams } = new URL(request.url)
  const event = await getCalendarEvent({
    eventId: params.eventId,
  })

  const serverEvent = mapGoogleToServer(event)

  if (searchParams.get('expandRecurrence') === 'true' && !!event.recurringEventId) {
    recurrenceEvent = await getCalendarEvent({
      eventId: event.recurringEventId,
    })

    serverEvent._recurrenceEvent = recurrenceEvent
    serverEvent.recurrence = recurrenceEvent.recurrence
  }

  return Response.json(serverEvent)
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } },
): Promise<Response> {
  await deleteCalendarEvent({ eventId: params.eventId })

  return Response.json({ success: true })
}

export async function PUT(
  request: Request,
  { params }: { params: { eventId: string } },
): Promise<Response> {
  const { eventId } = params
  const requestBody = await request.json()

  const response = await updateCalendarEvent({ eventId, requestBody })

  const data = mapGoogleToServer(response)

  return Response.json({ data })
}
