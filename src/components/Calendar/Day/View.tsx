'use client'

import { Avatar, Box, Chip, Collapse, IconButton, Tooltip, Typography } from '@mui/material'
import { RECURRENCE_MODE } from '@/utils/constants'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { udpateCalendarEvent } from '@/utils/api'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarAllDayEvent from '../AllDayEvent'
import CalendarEventDialog, { type EventDialogView } from '../EventDialog/Dialog'
import dayjs from 'dayjs'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HourTicker from '../HourTimeline'
import React from 'react'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR from 'swr'
import WeekDayTimedEvents from '../WeekDayTimedEvents'
import {
  fetchCalendarEventsBetweenDates,
  getBlankAllDayEvent,
  getDaysEvents,
  getEventfromMousePosition,
  mapServerToClient,
} from '@/utils/calendar'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Modifier,
} from '@dnd-kit/core'
import { useSession } from 'next-auth/react'
import { isMemberAdmin } from '@/utils/member'

const HOUR_HEIGHT = 48
const PX_RATIO = HOUR_HEIGHT / 60
const MAX_ALL_DAY = 3

function snapToTimeGrid(gridSize: number): Modifier {
  return ({ transform }) => {
    return {
      ...transform,
      x: Math.ceil(transform.x / gridSize) * gridSize,
      y: Math.ceil(transform.y / gridSize) * gridSize,
    }
  }
}

export default function DayView({
  events: initEvents = [],
}: {
  activeEvent?: IServerCalendarEvent
  events?: IServerCalendarEvent[]
}): JSX.Element {
  const { date, eventId, setEventId } = useCalendar()
  const { data: session } = useSession()
  const isAdmin = isMemberAdmin(session?.user)
  const now = dayjs()
  const isToday = now.isSame(date, 'day')
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
  const allDayEvents = React.useMemo(() => {
    return events
      .filter((e) => e.isAllDayEvent || e.isMultipleDayEvent)
      .sort((a: ICalendarEvent, b: ICalendarEvent) => {
        if (a.isNew && !b.isNew) return -1
        if (a.isAllDayEvent && !b.isAllDayEvent) return -1

        if (a.startDate.isBefore(b.startDate)) return -1
        if (a.startDate.isAfter(b.startDate)) return 1

        return 0
      })
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
  const [expandAllDayEvents, setExpandAllDayEvents] = React.useState(false)
  const extraAllDayEvents = Math.max(0, allDayEvents.length - MAX_ALL_DAY)
  const snapToGridModifier = snapToTimeGrid(HOUR_HEIGHT / 4)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  async function handleCalendarEventDelete(
    deletedEvent: ICalendarEvent,
    options: RecurrenceOptions,
  ): Promise<void> {
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

    await mutate(newData)
  }
  async function handleCalendarEventUpdate(
    newEvent: ICalendarEvent,
    options: RecurrenceOptions,
  ): Promise<void> {
    const { mode } = options

    if (mode === RECURRENCE_MODE.SINGLE) {
      const index = events.findIndex((e) => e.id === newEvent.id)
      const newData = [...events]

      newData.splice(index, 1, newEvent)
      await mutate(newData)
    } else {
      await mutate()
    }
  }
  async function handleCalendarEventCreate(newEvent: ICalendarEvent): Promise<void> {
    const newData = events.filter((e) => !e.isNew)

    await mutate([...newData, newEvent])
  }
  async function handleDialogClose(view: EventDialogView): Promise<void> {
    if (view === 'create' && newEvent) {
      const newEvents = events.filter((e) => e.id !== newEvent.id)

      await mutate(newEvents, { revalidate: false })
      setNewEvent(undefined)
    } else {
      setEventId(null)
    }
  }
  async function handleCreateAllDayEvent(
    clickEvent: React.MouseEvent<HTMLDivElement>,
  ): Promise<void> {
    const createEvent = getBlankAllDayEvent(date)
    await mutate([...events, createEvent], { revalidate: false })
    setEventId(null)
    setNewEvent(createEvent)
  }
  async function handleCreateTimedEvent(clickEvent: React.MouseEvent<HTMLElement>): Promise<void> {
    const createEvent = getEventfromMousePosition(clickEvent, date, HOUR_HEIGHT)

    if (createEvent) {
      await mutate([...events, createEvent], { revalidate: false })
      setEventId(null)
      setNewEvent(createEvent)
    }
  }
  function handleExpandAllDayEventsClick(clickEvent: React.MouseEvent<HTMLElement>): void {
    clickEvent.stopPropagation()
    setExpandAllDayEvents(!expandAllDayEvents)
  }

  async function handleDragDrop(dndEvent: DragEndEvent): Promise<void> {
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
        const startDate = event.startDate.add(timeChangeMinute, 'minutes')
        const endDate = event.endDate.add(timeChangeMinute, 'minutes')

        event.startDate = startDate
        event.endDate = endDate

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexShrink: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
        onClick={isAdmin ? handleCreateAllDayEvent : undefined}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            pt: 0.5,
            pb: 0.5,
            px: 0.5,
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexGrow: 1,
            }}
          >
            <Typography variant='body2' sx={{ color: isToday ? 'primary.main' : 'text.secondary' }}>
              {date.format('ddd')}
            </Typography>
            <Avatar
              sx={{
                bgcolor: isToday ? 'primary.main' : 'transparent',
                color: '#FFF',
                width: 48,
                height: 48,
                fontSize: '2rem',
                fontWeight: 'fontWeightBold',
              }}
            >
              {date.format('D')}
            </Avatar>
          </Box>
          {!!extraAllDayEvents && (
            <Box>
              <Tooltip title='Expand all-day events'>
                <IconButton size='small' onClick={handleExpandAllDayEventsClick}>
                  <ExpandMoreIcon
                    sx={{
                      transition: (theme) =>
                        theme.transitions.create('all', {
                          duration: theme.transitions.duration.standard,
                        }),
                      transform: expandAllDayEvents ? 'rotate(-180deg)' : 'rotate(0deg)',
                    }}
                    fontSize='inherit'
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        {!!allDayEvents.length && (
          <Box sx={{ flexGrow: 1, px: 0.5, py: 0.5 }}>
            <Collapse in={expandAllDayEvents} collapsedSize={84}>
              {allDayEvents.map((event) => (
                <CalendarAllDayEvent
                  key={event.id}
                  event={event}
                  hasLeftArrow={event.startDate.isBefore(date)}
                  hasRightArrow={
                    event.isAllDayEvent
                      ? event.endDate.isAfter(date.add(1, 'day').startOf('day'))
                      : event.endDate.isAfter(date.endOf('day'))
                  }
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Collapse>
            {!!extraAllDayEvents && !expandAllDayEvents && (
              <Chip
                size='small'
                sx={{
                  justifyContent: 'flex-start',
                  bgcolor: 'transparent',
                  borderRadius: 1,
                  height: 24,
                  fontWeight: 'fontWeightBold',
                }}
                label={`${extraAllDayEvents} more`}
                onClick={handleExpandAllDayEventsClick}
              />
            )}
          </Box>
        )}
      </Box>
      <HourTicker height={HOUR_HEIGHT}>
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <DndContext
            onDragEnd={handleDragDrop}
            sensors={sensors}
            collisionDetection={pointerWithin}
            modifiers={[restrictToVerticalAxis, snapToGridModifier, restrictToParentElement]}
          >
            <WeekDayTimedEvents
              date={date}
              events={getDaysEvents(timedEvents, date)}
              onBackgroundClick={isAdmin ? handleCreateTimedEvent : undefined}
              disableBorder
            />
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
