'use client'

import React from 'react'
import { useQueryState } from 'next-usequerystate'
import dayjs, { type Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { CALENDAR_VIEW } from '@/utils/constants'
import { useRouter } from 'next/navigation'

dayjs.extend(isBetween)
dayjs.extend(relativeTime)
dayjs.extend(utc)

interface CalendarContextProps {
  date: Dayjs
  eventId: string | null
  view: CALENDAR_VIEW
  setView: (view: CALENDAR_VIEW) => void
  setDate: (date: Dayjs) => void
  setEventId: (eventId: string | null) => void
}

const CalendarContext = React.createContext<CalendarContextProps | null>(null)

export default function CalendarProvider({
  children,
  date: initDate,
  event: initEvent,
  view: initView = CALENDAR_VIEW.MONTH,
}: {
  date?: Dayjs
  event?: string
  view?: CALENDAR_VIEW
  children: React.ReactNode
}): JSX.Element {
  const router = useRouter()
  const [date, setDate] = useQueryState('date', {
    parse: (query: string) => dayjs(query),
    serialize: (value: Dayjs) => value.format('YYYY-MM-DD'),
    defaultValue: dayjs(),
    history: 'push',
  })
  const [eventId, setEventId] = useQueryState('eventId', {
    history: 'push',
  })
  const [view, setView] = React.useState(initView)

  function handleSetView(newView: CALENDAR_VIEW): void {
    setView(newView)

    if (dayjs().isSame(date, 'day')) {
      router.push(`/calendar/${newView}`)
    } else {
      router.push(`/calendar/${newView}?date=${date.format('YYYY-MM-DD')}`)
    }
  }

  React.useEffect(() => {
    if (view !== initView) setView(initView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initView])

  return (
    <CalendarContext.Provider
      value={{ date, setDate, eventId, setEventId, view, setView: handleSetView }}
    >
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
