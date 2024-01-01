'use client'

import React from 'react'
import { fetchCalendarEventsBetweenDates, mapServerToClient } from '@/utils/calendar'
import { useCalendar } from '@/hooks/useCalendar'
import { Box } from '@mui/material'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR, { type MutatorOptions } from 'swr'
import CalendarEventDialog from '../EventDialog/Dialog'
import { RECURRENCE_MODE } from '@/utils/constants'

export default function DayView({
  activeEvent: initActiveEvent,
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const { date, activeEvent, setActiveEvent } = useCalendar()
  const firstDate = React.useMemo(() => {
    return date.startOf('day')
  }, [date])
  const lastDate = React.useMemo(() => {
    return date.endOf('day')
  }, [date])
  const { data: events, mutate } = useSWR(
    `${firstDate.format()}|${lastDate.format()}`,
    fetchCalendarEventsBetweenDates,
    {
      fallbackData: initEvents.map(mapServerToClient),
    },
  )

  function handleMutate(data: ICalendarEvent[], options?: MutatorOptions<ICalendarEvent[]>): void {
    void mutate(data, options)
  }
  function handleCalendarEventDelete(
    deletedEvent: ICalendarEvent,
    options: RecurrenceOptions,
  ): void {
    const { mode } = options
    let newData: ICalendarEvent[] = []

    if (mode === RECURRENCE_MODE.SINGLE) {
      newData = events.filter((e) => e.id !== deletedEvent.id)
    } else if (mode === RECURRENCE_MODE.ALL) {
      newData = events.filter(
        (e) => e?._event?.recurringEventId !== deletedEvent?._event?.recurringEventId,
      )
    } else if (mode === RECURRENCE_MODE.FUTURE) {
      const stopDate = deletedEvent.startDate.subtract(1, 'day').endOf('day')

      newData = events.filter((e) => {
        return (
          e?._event?.recurringEventId !== deletedEvent?._event?.recurringEventId ||
          (e?._event?.recurringEventId === deletedEvent?._event?.recurringEventId &&
            e.startDate.isBefore(stopDate))
        )
      })
    }

    handleMutate(newData)
  }
  function handleCalendarEventUpdate(newEvent: ICalendarEvent, options: RecurrenceOptions): void {
    const { mode } = options

    if (mode === RECURRENCE_MODE.SINGLE) {
      const index = events.findIndex((e) => e.id === newEvent.id)
      const newData = [...events]

      newData.splice(index, 1, newEvent)
      handleMutate(newData)
    } else {
      void mutate()
    }
  }
  function handleCalendarEventCreate(newEvent: ICalendarEvent): void {
    const newData = events.filter((e) => !e.isNew)

    handleMutate([...newData, newEvent])
  }

  React.useEffect(() => {
    if (initActiveEvent) setActiveEvent(mapServerToClient(initActiveEvent))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <React.Fragment>
      <Box>Day View</Box>
      <CalendarEventDialog
        key={activeEvent?.id ?? 'key'}
        open={Boolean(activeEvent)}
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        event={activeEvent!}
        onDelete={handleCalendarEventDelete}
        onUpdate={handleCalendarEventUpdate}
        onCreate={handleCalendarEventCreate}
        onClose={() => {
          if (activeEvent?.isNew) {
            const newEvents = events.filter((e) => e.id !== activeEvent.id)

            handleMutate(newEvents, { revalidate: false })
          }
          setActiveEvent(null)
        }}
      />
    </React.Fragment>
  )
}
