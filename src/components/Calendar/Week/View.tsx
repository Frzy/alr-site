'use client'

import React from 'react'
import { Box } from '@mui/material'
import { RECURRENCE_MODE } from '@/utils/constants'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { udpateCalendarEvent } from '@/utils/api'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarEventDialog, { type EventDialogView } from '../EventDialog/Dialog'
import dayjs, { type Dayjs } from 'dayjs'
import HourTicker from '../HourTimeline'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR, { type MutatorOptions } from 'swr'
import WeekDayTimedEvents from '../WeekDayTimedEvents'
import WeekHeader from './WeekHeader'
import {
  combineDateAndTime,
  fetchCalendarEventsBetweenDates,
  getBlankAllDayEvent,
  getDaysEvents,
  getEventfromMousePosition,
  mapServerToClient,
  resetEvent,
  updateEventStartDate,
} from '@/utils/calendar'
import {
  DndContext,
  PointerSensor,
  pointerWithin,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type Modifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useSession } from 'next-auth/react'
import { isMemberAdmin } from '@/utils/member'

const HOUR_HEIGHT = 48
const PX_RATIO = HOUR_HEIGHT / 60

function snapToTimeGrid(gridSize: number): Modifier {
  return ({ transform, active, over }) => {
    const isTimedEvent = active?.data?.current?.timedEvent
    const canDrop = over?.data?.current?.timedDroppable
    if (isTimedEvent & canDrop) {
      const weekdayWidth = over?.rect?.width ?? 0
      const weekdayDelta = over?.data?.current?.weekday - active?.data?.current?.weekday
      const minDelta = (0 - active?.data?.current?.weekday) * weekdayWidth

      const delta = Math.max(minDelta, weekdayDelta * weekdayWidth)

      return {
        ...transform,
        x: delta,
        y: Math.ceil(transform.y / gridSize) * gridSize,
      }
    }

    return transform
  }
}

export default function WeekView({
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const { date, eventId, setEventId } = useCalendar()
  const { data: session } = useSession()
  const isAdmin = isMemberAdmin(session?.user)
  const firstDate = React.useMemo(() => {
    return date.startOf('week').startOf('day')
  }, [date])
  const lastDate = React.useMemo(() => {
    return date.endOf('week').endOf('day')
  }, [date])
  const { data: events, mutate } = useSWR(
    `${firstDate.format()}|${lastDate.format()}`,
    fetchCalendarEventsBetweenDates,
    {
      fallbackData: initEvents.map(mapServerToClient),
    },
  )
  const allDayEvents = React.useMemo(() => {
    return events.filter((e) => e.isAllDayEvent || e.isMultipleDayEvent)
  }, [events])
  const timedEvents = React.useMemo(() => {
    return events
      .filter((e) => !e.isAllDayEvent && !e.isMultipleDayEvent)
      .sort((a, b) => {
        if (a.startDate.isSame(b.startDate, 'minute')) return 0

        return a.startDate.isAfter(b.startDate) ? 1 : -1
      })
  }, [events])
  const [newEvent, setNewEvent] = React.useState<ICalendarEvent>()
  const activeEvent = React.useMemo<ICalendarEvent | string | null>(() => {
    const event = events.find((e) => e.id === eventId)

    if (event) return event

    return eventId
  }, [events, eventId])
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )
  const snapToGridModifier = snapToTimeGrid(HOUR_HEIGHT / 4)

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
    setTimeout(() => {
      void mutate([...events])
    }, 250)
  }
  function handleCreateAllDayCalendarEvent(date: Dayjs): void {
    const createEvent = getBlankAllDayEvent(date)
    setEventId(null)
    setNewEvent(createEvent)

    void mutate([...events, createEvent], { revalidate: false })
  }
  function handleCreateTimedCalendarEvent(
    clickEvent: React.MouseEvent<HTMLElement>,
    day: Dayjs,
  ): void {
    const createEvent = getEventfromMousePosition(clickEvent, day, HOUR_HEIGHT)

    if (createEvent) {
      void mutate([...events, createEvent], { revalidate: false })
      setEventId(null)
      setNewEvent(createEvent)
    }
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
  function handleAllDayDragCancel({ active }: DragCancelEvent): void {
    if (active.id) {
      const eventIndex = events.findIndex((e) => e.id === active.id)

      if (eventIndex > -1) {
        let newData = [...events]
        const [event] = newData.splice(eventIndex, 1)

        const updatedEvent = resetEvent(event)
        newData.push(updatedEvent)

        newData = newData.map((e) => {
          e._renderIndex = -1
          return e
        })

        void mutate(newData, { revalidate: false })
      }
    }
  }
  function handleAllDayDragOver({ active, over }: DragOverEvent): void {
    if (over?.id) {
      const eventIndex = events.findIndex((e) => e.id === active.id)

      if (eventIndex > -1) {
        let newData = [...events]
        const [event] = newData.splice(eventIndex, 1)

        const updatedEvent = updateEventStartDate(event, dayjs(over.id))
        newData.push(updatedEvent)
        newData = newData.map((e) => ({ ...e, _renderIndex: -1 }))

        void mutate(newData, { revalidate: false })
      }
    }
  }
  async function handleAllDayDragDrop(dndEvent: DragEndEvent): Promise<void> {
    const eventId = dndEvent.active.id
    const eventIndex = events.findIndex((e) => e.id === eventId)

    await udpateCalendarEvent(events[eventIndex])

    void mutate([...events])
  }

  async function handleTimedDragDrop(dndEvent: DragEndEvent): Promise<void> {
    if (dndEvent.collisions?.length) {
      const eventId = dndEvent.active.id
      const eventIndex = events.findIndex((e) => e.id === eventId)
      const event = events[eventIndex]

      if (event) {
        const newEvents = [...events]
        newEvents.splice(eventIndex, 1)

        let timeChangePx = dndEvent.delta.y
        const remander = Math.abs(timeChangePx) % 12

        if (12 - remander >= remander) {
          timeChangePx += timeChangePx > 0 ? -remander : remander
        } else {
          timeChangePx += timeChangePx > 0 ? -(12 - remander) : 12 - remander
        }

        const timeChangeMinute = timeChangePx / PX_RATIO

        const date = dayjs(dndEvent?.over?.id)
        const startTime = event.startDate.add(timeChangeMinute, 'minutes')
        const endTime = event.endDate.add(timeChangeMinute, 'minutes')

        event.startDate = combineDateAndTime(date, startTime)
        event.endDate = combineDateAndTime(date, endTime)

        void mutate([...newEvents, event], { revalidate: false })
        await udpateCalendarEvent(event)
        void mutate()
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <DndContext
        onDragCancel={handleAllDayDragCancel}
        onDragOver={handleAllDayDragOver}
        onDragEnd={handleAllDayDragDrop}
        sensors={sensors}
        collisionDetection={pointerWithin}
      >
        <WeekHeader
          startDate={firstDate}
          events={allDayEvents}
          onCreateAllDayEvent={isAdmin ? handleCreateAllDayCalendarEvent : undefined}
        />
      </DndContext>
      <HourTicker height={48}>
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <DndContext
            onDragEnd={handleTimedDragDrop}
            sensors={sensors}
            collisionDetection={pointerWithin}
            modifiers={[snapToGridModifier, restrictToFirstScrollableAncestor]}
          >
            {Array.from(Array(7)).map((_, i) => (
              <WeekDayTimedEvents
                key={i}
                date={firstDate.add(i, 'days')}
                events={getDaysEvents(timedEvents, firstDate.add(i, 'days'))}
                onBackgroundClick={isAdmin ? handleCreateTimedCalendarEvent : undefined}
                disableBorder={i === 0}
              />
            ))}
          </DndContext>
        </Box>
      </HourTicker>
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
    </Box>
  )
}
