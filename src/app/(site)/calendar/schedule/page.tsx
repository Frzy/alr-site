import ScheduleView from '@/components/Calendar/Schedule/View'
import { getCalendarEvent, getCalendarEvents } from '@/lib/calendar'
import type { IServerCalendarEvent } from '@/types/common'
import { mapGoogleToServer } from '@/utils/calendar'
import dayjs from 'dayjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Schedule',
  description: 'American Legion Riders Chapter 91 Schedule',
}

export default async function CalendarSchedulePage({
  searchParams,
}: {
  searchParams?: Record<string, string>
}): Promise<JSX.Element> {
  const date = searchParams?.date ? dayjs(searchParams.date) : dayjs()
  let activeEvent: IServerCalendarEvent | undefined

  const googleEvents = await getCalendarEvents({
    timeMin: date.startOf('day').format(),
    timeMax: date.add(3, 'months').endOf('day').format(),
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

  return <ScheduleView activeEvent={activeEvent} events={events} />
}
