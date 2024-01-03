import { getCalendarEvent, getCalendarEvents } from '@/lib/calendar'
import { mapGoogleToServer } from '@/utils/calendar'
import dayjs from 'dayjs'
import type { IServerCalendarEvent } from '@/types/common'
import type { Metadata } from 'next'
import WeekView from '@/components/Calendar/Week/View'

export const metadata: Metadata = {
  title: 'ALR 91: Week Calendar',
  description: 'American Legion Riders Chapter 91 Week Calendar',
}

export default async function CalendarWeekPage({
  searchParams,
}: {
  searchParams?: Record<string, string>
}): Promise<JSX.Element> {
  const date = searchParams?.date ? dayjs(searchParams.date) : dayjs()
  let activeEvent: IServerCalendarEvent | undefined

  const googleEvents = await getCalendarEvents({
    timeMin: date.startOf('week').startOf('day').format(),
    timeMax: date.endOf('week').endOf('day').format(),
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

  return <WeekView activeEvent={activeEvent} events={events} />
}
