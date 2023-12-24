'use client'

import React from 'react'
import { fetchCalendarEventsBetweenDates, mapServerToClient } from '@/utils/calendar'
import { useCalendar } from '@/hooks/useCalendar'
import { useMediaQuery, useTheme } from '@mui/material'
import DesktopMonthView from './DesktopView'
import MobileMonthView from './MobileView'
import type { ICalendarEvent, IServerCalendarEvent } from '@/types/common'
import useSWR, { type MutatorOptions } from 'swr'

export default function MonthView({
  activeEvent: initActiveEvent,
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { date, setActiveEvent } = useCalendar()
  const firstDate = React.useMemo(() => {
    return date.startOf('month').day(0)
  }, [date])
  const lastDate = React.useMemo(() => {
    return date.endOf('month').day(7)
  }, [date])
  const { data: events, mutate } = useSWR(
    `${firstDate.format()}|${lastDate.format()}`,
    fetchCalendarEventsBetweenDates,
    {
      fallbackData: initEvents.map(mapServerToClient),
    },
  )
  const totalDays = React.useMemo(() => lastDate.diff(firstDate, 'days'), [firstDate, lastDate])
  const days = React.useMemo(() => Array.from({ length: totalDays }, (_, i) => i), [totalDays])

  function handleMutate(data: ICalendarEvent[], options?: MutatorOptions<ICalendarEvent[]>): void {
    void mutate(data, options)
  }

  React.useEffect(() => {
    if (initActiveEvent) setActiveEvent(mapServerToClient(initActiveEvent))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isMobile ? (
    <MobileMonthView events={events} firstDate={firstDate} days={days} onMutate={handleMutate} />
  ) : (
    <DesktopMonthView events={events} firstDate={firstDate} days={days} onMutate={handleMutate} />
  )
}
