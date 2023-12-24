import MonthView from '@/components/Calendar/Month/View'
import { getCalendarEvent, getCalendarEvents } from '@/lib/calendar'
import type { IServerCalendarEvent } from '@/types/common'
import { mapGoogleToServer } from '@/utils/calendar'
import dayjs from 'dayjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ALR 91: Month Calendar',
  description: 'American Legion Riders Chapter 91 Month Calendar',
}

export default async function CalendarMonthPage({
  searchParams,
}: {
  searchParams?: Record<string, string>
}): Promise<JSX.Element> {
  const date = searchParams?.date ? dayjs(searchParams.date) : dayjs()
  let activeEvent: IServerCalendarEvent | undefined

  const googleEvents = await getCalendarEvents({
    timeMin: date.startOf('month').day(0).format(),
    timeMax: date.endOf('month').day(7).format(),
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

  return <MonthView activeEvent={activeEvent} events={events} />
}
