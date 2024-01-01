'use client'

import React from 'react'
import { useQueryState } from 'next-usequerystate'
import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(isBetween)
dayjs.extend(relativeTime)
dayjs.extend(utc)

interface CalendarContextProps {
  date: Dayjs
  eventId: string | null
  setDate: (date: Dayjs) => void
  setEventId: (eventId: string | null) => void
}

const CalendarContext = React.createContext<CalendarContextProps | null>(null)

export default function CalendarProvider({
  children,
  date: initDate,
  event: initEvent,
}: {
  date: Dayjs
  event?: string
  children: React.ReactNode
}): JSX.Element {
  const [date, setDate] = useQueryState('date', {
    parse: (query: string) => dayjs(query),
    serialize: (value: Dayjs) => value.format('YYYY-MM-DD'),
    defaultValue: dayjs(),
    history: 'push',
  })
  const [eventId, setEventId] = useQueryState('eventId', {
    history: 'push',
  })

  return (
    <CalendarContext.Provider value={{ date, setDate, eventId, setEventId }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): CalendarContextProps {
  const context = React.useContext(CalendarContext)

  if (context === null) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }

  return context
}
