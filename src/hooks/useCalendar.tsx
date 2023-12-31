'use client'

import React from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import type { ICalendarEvent } from '@/types/common'

dayjs.extend(isBetween)
dayjs.extend(relativeTime)
dayjs.extend(utc)

interface CalendarContextProps {
  date: Dayjs
  activeEvent: ICalendarEvent | null
  setDate: (date: Dayjs) => void
  setActiveEvent: (event: ICalendarEvent | null) => void
}

const CalendarContext = React.createContext<CalendarContextProps | null>(null)

export default function CalendarProvider({
  children,
  date: initDate,
  event: initEvent,
}: {
  date: Dayjs
  event?: ICalendarEvent
  children: React.ReactNode
}): JSX.Element {
  const [date, setDate] = React.useState<Dayjs>(initDate)
  const [activeEvent, setActiveEvent] = React.useState<ICalendarEvent | null>(initEvent ?? null)

  // React.useEffect(() => {
  //   const urlParams = getUrlParams()
  //   const fomattedDate = date.format('M/D/YYYY')

  //   if (urlParams.has('date') && urlParams.get('date') === fomattedDate) return

  //   if (date.isSame(dayjs(), 'day') && urlParams.has('date')) {
  //     urlParams.delete('date')
  //   } else {
  //     urlParams.set('date', fomattedDate)
  //   }

  //   router.push(getUrl(pathname, urlParams))
  // }, [date])

  // React.useEffect(() => {
  //   const urlParams = getUrlParams()
  //   if (activeEvent === null && urlParams.has('eventId')) {
  //     urlParams.delete('eventId')

  //     router.push(getUrl(pathname, urlParams))
  //   } else if (activeEvent?.id && urlParams.get('eventId') !== activeEvent.id) {
  //     urlParams.set('eventId', activeEvent.id)

  //     router.push(getUrl(pathname, urlParams))
  //   }
  // }, [activeEvent])

  return (
    <CalendarContext.Provider value={{ date, setDate, activeEvent, setActiveEvent }}>
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
