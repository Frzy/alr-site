import DayView from '@/components/Calendar/Day/View'
import { getCalendarEvent, getCalendarEvents } from '@/lib/calendar'
import type { IServerCalendarEvent } from '@/types/common'
import { mapGoogleToServer } from '@/utils/calendar'
import dayjs from 'dayjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Day Calendar',
  description: 'American Legion Riders Chapter 91 Day Calendar',
}

export default async function CalendarDayPage({
  searchParams,
}: {
  searchParams?: Record<string, string>
}): Promise<JSX.Element> {
  const date = searchParams?.date ? dayjs(searchParams.date) : dayjs()
  let activeEvent: IServerCalendarEvent | undefined

  const googleEvents = await getCalendarEvents({
    timeMin: date.startOf('day').format(),
    timeMax: date.endOf('day').format(),
    orderBy: 'startTime',
    singleEvents: true,
  })
  const events = googleEvents.map(mapGoogleToServer)

  if (searchParams?.eventId) {
    const { eventId } = searchParams
    activeEvent = events.find((e) => e.id === eventId)

    if (!activeEvent) {
      const calendarEvent = await getCalendarEvent({ eventId: searchParams.eventId })

      activeEvent = mapGoogleToServer(calendarEvent)
    }
  }

  return <DayView activeEvent={activeEvent} events={events} />
}
