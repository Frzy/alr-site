import { getServerAuthSession } from '@/lib/auth'
import { createCalendarEvent, getCalendarEvents } from '@/lib/calendar'
import { mapGoogleToServer } from '@/utils/calendar'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  const calendarEvents = await getCalendarEvents({
    timeMin: typeof start === 'string' ? start : undefined,
    timeMax: typeof end === 'string' ? end : undefined,
    orderBy: 'startTime',
    singleEvents: true,
  })

  return Response.json(calendarEvents.map(mapGoogleToServer))
}

export async function POST(request: Request): Promise<Response> {
  const session = await getServerAuthSession()
  if (!session) return Response.json(null, { status: 401, statusText: 'Unauthenticated' })

  const requestBody = await request.json()
  const response = await createCalendarEvent({ requestBody })

  return Response.json({ response })
}
