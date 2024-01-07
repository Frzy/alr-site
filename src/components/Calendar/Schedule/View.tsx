'use client'

import React from 'react'
import { List } from '@mui/material'
import { RECURRENCE_MODE } from '@/utils/constants'
import dayjs from 'dayjs'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarEventDialog, { type EventDialogView } from '../EventDialog/Dialog'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR from 'swr'
import { fetchCalendarEventsBetweenDates, getDaysEvents, mapServerToClient } from '@/utils/calendar'
import ScheduleDay from './ScheduleDay'

export default function ScheduleView({
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const { date, eventId, setEventId } = useCalendar()
  const { firstDate, lastDate } = React.useMemo(() => {
    const firstDate = date.startOf('day')
    const lastDate = date.add(3, 'months').endOf('day')

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
  const dayBuckets = React.useMemo(() => {
    const totalDays = lastDate.diff(firstDate, 'days')
    const buckets = Array.from(Array(totalDays), (_, day) => {
      const date = dayjs(firstDate.add(day, 'days'))
      const dayEvents = getDaysEvents(events, date).sort((a, b) => {
        const aAllDay = a.isAllDayEvent || a.isMultipleDayEvent
        const bAllDay = b.isAllDayEvent || b.isMultipleDayEvent
        const aSummary = a?.summary ?? '(No Title)'
        const bSummary = b?.summary ?? '(No Title)'

        if (aAllDay && bAllDay) {
          return aSummary.localeCompare(bSummary)
        } else if (!aAllDay && bAllDay) {
          return 1
        } else if (aAllDay && !bAllDay) {
          return -1
        }

        if (a.startDate.isSame(b.startDate, 'minute')) return aSummary.localeCompare(bSummary)
        if (a.startDate.isBefore(b.startDate)) return -1
        if (a.startDate.isAfter(b.startDate)) return 1

        return 0
      })

      return { date, events: dayEvents }
    })

    return buckets.filter((b) => b.events.length).slice(0, 30)
  }, [events, firstDate, lastDate])

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

    void mutate(newData)
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
      <List sx={{ width: '100%' }}>
        {dayBuckets.map(({ date, events }, index) => (
          <ScheduleDay
            key={index}
            date={date}
            events={events}
            divider={dayBuckets.length - 1 !== index}
          />
        ))}
      </List>
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
