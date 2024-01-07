'use client'

import React from 'react'
import { Box } from '@mui/material'
import { RECURRENCE_MODE } from '@/utils/constants'
import { type Dayjs } from 'dayjs'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarEventDialog, { type EventDialogView } from '../EventDialog/Dialog'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR from 'swr'
import { fetchCalendarEventsBetweenDates, mapServerToClient } from '@/utils/calendar'

export default function ScheduleView({
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const { date, eventId, setEventId } = useCalendar()
  const { firstDate, lastDate } = React.useMemo(() => {
    const firstDate = date.startOf('day')
    const lastDate = date.add(2, 'months').endOf('day')

    return { firstDate, lastDate }
  }, [date])
  const { data: events, mutate } = useSWR(
    `${firstDate.format()}|${lastDate.format()}`,
    fetchCalendarEventsBetweenDates,
    {
      fallbackData: initEvents.map(mapServerToClient),
    },
  )
  const activeEvent = React.useMemo<ICalendarEvent | string | null>(() => {
    const event = events.find((e) => e.id === eventId)

    if (event) return event

    return eventId
  }, [events, eventId])
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
      void mutate(newData)
    } else {
      void mutate()
    }
  }
  function handleDialogClose(view: EventDialogView): void {
    setEventId(null)
  }

  return (
    <React.Fragment>
      <Box>Schedule View</Box>
      {activeEvent && (
        <CalendarEventDialog
          key={eventId}
          open={true}
          event={activeEvent}
          onDelete={handleCalendarEventDelete}
          onUpdate={handleCalendarEventUpdate}
          onClose={handleDialogClose}
        />
      )}
    </React.Fragment>
  )
}
