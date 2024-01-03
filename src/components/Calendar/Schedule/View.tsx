'use client'

import React from 'react'
import { Box } from '@mui/material'
import { RECURRENCE_MODE } from '@/utils/constants'
import { type Dayjs } from 'dayjs'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarEventDialog, { type EventDialogView } from '../EventDialog/Dialog'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR, { type MutatorOptions } from 'swr'
import {
  fetchCalendarEventsBetweenDates,
  getBlankEventForDate,
  mapServerToClient,
} from '@/utils/calendar'

export default function ScheduleView({
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const { date, eventId, setEventId } = useCalendar()
  const firstDate = React.useMemo(() => {
    return date.startOf('day')
  }, [date])
  const lastDate = React.useMemo(() => {
    return date.add(2, 'months').endOf('day')
  }, [date])
  const { data: events, mutate } = useSWR(
    `${firstDate.format()}|${lastDate.format()}`,
    fetchCalendarEventsBetweenDates,
    {
      fallbackData: initEvents.map(mapServerToClient),
    },
  )
  const [newEvent, setNewEvent] = React.useState<ICalendarEvent>()
  const activeEvent = React.useMemo<ICalendarEvent | string | null>(() => {
    const event = events.find((e) => e.id === eventId)

    if (event) return event

    return eventId
  }, [events, eventId])

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
  function handleNewCalendarEvent(createDate: Dayjs): void {
    const createEvent = getBlankEventForDate(createDate)
    handleMutate([...events, createEvent], { revalidate: false })
    setEventId(null)
    setNewEvent(createEvent)
  }
  function handleDialogClose(view: EventDialogView): void {
    if (view === 'create' && newEvent) {
      const newEvents = events.filter((e) => e.id !== newEvent.id)

      handleMutate(newEvents, { revalidate: false })
      setNewEvent(undefined)
    } else {
      setEventId(null)
    }
  }

  return (
    <React.Fragment>
      <Box>Schedule View</Box>
      {(newEvent ?? activeEvent) && (
        <CalendarEventDialog
          key={eventId}
          open={true}
          event={newEvent ?? activeEvent}
          onDelete={handleCalendarEventDelete}
          onUpdate={handleCalendarEventUpdate}
          onCreate={handleCalendarEventCreate}
          onClose={handleDialogClose}
        />
      )}
    </React.Fragment>
  )
}
