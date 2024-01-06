'use client'

import React from 'react'
import {
  Avatar,
  Box,
  type BoxProps,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { RECURRENCE_MODE } from '@/utils/constants'
import dayjs from 'dayjs'
import { useCalendar } from '@/hooks/useCalendar'
import CalendarEventDialog, { type EventDialogView } from '../EventDialog/Dialog'
import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import useSWR from 'swr'
import {
  fetchCalendarEventsBetweenDates,
  getBlankAllDayEvent,
  getEventfromMousePosition,
  mapServerToClient,
} from '@/utils/calendar'
import AllDayEvent from './AllDayEvent'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TimeEvent from './TimeEvent'
import HelmetIcon from '@mui/icons-material/SportsMotorsports'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type Modifier,
} from '@dnd-kit/core'
import { udpateCalendarEvent } from '@/utils/api'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'

const RIGHT_PADDING = 24
const HOUR_HEIGHT = 48
const MIN_TO_PX_RATIO = HOUR_HEIGHT / 60
const MAX_ALL_DAY = 3

interface TimedEventProps {
  event: ICalendarEvent
  top: number
  height: number
  left: number
  width: number
}

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
  function handleEventClick(event: ICalendarEvent): void {
    setEventId(event.id)
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
  function getCalendarDayTimedEvents(): JSX.Element[] {
    const timedProps: TimedEventProps[] = []

    timedEvents.forEach((currentEvent, index) => {
      const curStartDate = currentEvent.startDate
      const curEndDate = currentEvent.endDate
      const fromMidnight = curStartDate.diff(curStartDate.startOf('day'), 'minutes')
      const duration = curEndDate.diff(curStartDate, 'minutes')
      const top = fromMidnight * MIN_TO_PX_RATIO
      const height = duration * MIN_TO_PX_RATIO
      const width = 100
      let left = 0
      const intersectIndex = timedProps.findLastIndex((p) => {
        return curStartDate.isBefore(p.event.endDate)
      })
      const intersectingProp = intersectIndex > -1 ? timedProps[intersectIndex] : undefined

      if (intersectingProp) {
        const diff = curStartDate.diff(intersectingProp.event.startDate, 'minutes')

        if (diff >= 45) {
          left = intersectingProp.left + 5
        } else {
          left = intersectingProp.left + 30
          intersectingProp.width -= 10
        }
      }

      timedProps[index] = {
        event: currentEvent,
        top,
        height,
        left,
        width,
      }
    })

    return timedProps.map(({ event, top, height, left, width }, index) => (
      <TimeEvent
        key={event.id}
        event={event}
        sx={{
          top,
          height,
          left: `${left}%`,
          width: `calc(${width - left}% - ${RIGHT_PADDING}px)`,
          zIndex: index,
        }}
        onClick={handleEventClick}
      />
    ))
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

        const timeChangeMinute = timeChangePx / MIN_TO_PX_RATIO
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
    <DndContext
      onDragEnd={handleDragDrop}
      sensors={sensors}
      collisionDetection={pointerWithin}
      modifiers={[restrictToVerticalAxis, snapToGridModifier, restrictToParentElement]}
    >
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
          onClick={handleCreateAllDayEvent}
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
              <Typography
                variant='body2'
                sx={{ color: isToday ? 'primary.main' : 'text.secondary' }}
              >
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
                  <AllDayEvent
                    key={event.id}
                    event={event}
                    date={date}
                    sx={{ mb: 0.5 }}
                    onEventClick={handleEventClick}
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
        <Box
          sx={{
            flexGrow: 1,
            overflowX: 'auto',
            overflowY: 'scroll',
            display: 'flex',
            '&:hover::-webkit-scrollbar-thumb': {
              backgroundColor: '#3f3f3f',
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 2,
              border: '4px solid transparent',
              backgroundClip: 'content-box',
              backgroundColor: '#1E1E1E',
            },
            '&::-webkit-scrollbar': {
              width: 16,
            },
            '&::-webkit-scrollbar-track': {
              borderRadius: 2,
            },
          }}
        >
          <Box sx={{ width: 48 }}>
            {Array.from(Array(24)).map((_, index) => (
              <Box key={index} height={HOUR_HEIGHT}>
                <Typography
                  component='span'
                  variant='caption'
                  sx={{
                    top: -10,
                    textAlign: 'right',
                    position: 'relative',
                    display: 'block',
                    color: 'text.secondary',
                    mr: 0,
                    pr: 1,
                  }}
                >
                  {index === 0 ? '' : index % 12 === 0 ? 12 : index % 12}{' '}
                  {index === 0 ? '' : index < 12 ? 'am' : 'pm'}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              position: 'relative',
            }}
            onClick={handleCreateTimedEvent}
          >
            <Box sx={{ display: 'flex', width: '100%' }}>
              <Box aria-hidden='true'>
                {Array.from(Array(24)).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: HOUR_HEIGHT,
                      '&::after': {
                        content: '""',
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        position: 'absolute',
                        width: '100%',
                        marginTop: '-1px',
                        pointerEvents: 'none',
                      },
                    }}
                  />
                ))}
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  ml: 1,
                  borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                  position: 'relative',
                }}
              >
                <Droppable>{getCalendarDayTimedEvents()}</Droppable>
              </Box>
              {isToday && (
                <Box
                  position='absolute'
                  top={now.diff(now.startOf('day'), 'minutes') * MIN_TO_PX_RATIO}
                  left={6}
                  bgcolor='red'
                  height={2}
                  right={0}
                  zIndex={500}
                >
                  <Box ml='-12px' mt='-12px'>
                    <HelmetIcon
                      sx={{
                        color: 'red',
                        transform: 'scaleX(-1)',
                        height: 24,
                        width: 24,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
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
    </DndContext>
  )
}

function Droppable({ sx, children, id = 'droppable', ...other }: BoxProps): JSX.Element {
  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <Box
      {...other}
      ref={setNodeRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
