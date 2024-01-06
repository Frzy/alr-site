import type { ICalendarEvent } from '@/types/common'
import { getDaysEvents, sortDayEvents } from '@/utils/calendar'
import { useDroppable } from '@dnd-kit/core'
import { Box, type BoxProps, IconButton, Typography, Collapse, Chip, Tooltip } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import React from 'react'
import WeekAllDayEvent from './WeekAllDayEvent'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const EVENT_HEIGHT = 24
const EVENT_GAP = 2
const MIN_EVENTS = 2

interface WeekHeaderProps {
  startDate: Dayjs
  events?: ICalendarEvent[]
  onCreateAllDayEvent?: (date: Dayjs) => void
}
export default function WeekHeader({
  events = [],
  startDate,
  onCreateAllDayEvent,
}: WeekHeaderProps): JSX.Element {
  const [showAllDayEvents, setShowAllDayEvents] = React.useState(false)
  const buckets = Array.from(Array(7)).map((_, index) => {
    const day = startDate.add(index, 'day')
    return { day, events: getDaysEvents(events, day) }
  })
  const { maxDayEvents, extraAllDayEvents } = buckets.reduce(
    (numbers, bucket) => {
      return {
        maxDayEvents: Math.max(numbers.maxDayEvents, bucket.events.length),
        extraAllDayEvents: Math.max(numbers.extraAllDayEvents, bucket.events.length - MIN_EVENTS),
      }
    },
    { maxDayEvents: 0, extraAllDayEvents: 0 },
  )

  function handleShowAllDayEvents(value: boolean): void {
    setShowAllDayEvents(value)
  }

  return (
    <Box sx={{ display: 'flex', pr: 2 }}>
      <Box sx={{ maxWidth: 57, flex: '1 1 100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ maxHeight: 70, flex: '1 1 100%' }} />
        <Box
          sx={{
            flex: '1 1 100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {!!extraAllDayEvents && (
            <Box>
              <Tooltip title='Expand all-day events'>
                <IconButton
                  size='small'
                  onClick={() => {
                    handleShowAllDayEvents(!showAllDayEvents)
                  }}
                >
                  <ExpandMoreIcon
                    sx={{
                      transition: (theme) =>
                        theme.transitions.create('all', {
                          duration: theme.transitions.duration.standard,
                        }),
                      transform: showAllDayEvents ? 'rotate(-180deg)' : 'rotate(0deg)',
                    }}
                    fontSize='inherit'
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
      {buckets.map((bucket, index) => (
        <WeekDayHeader
          key={index}
          date={bucket.day}
          events={bucket.events}
          maxEvents={maxDayEvents}
          showAllDayEvents={showAllDayEvents}
          hasCollapsedEvents={!!extraAllDayEvents}
          onShowAllEventChange={handleShowAllDayEvents}
          onCreateAllDayEvent={onCreateAllDayEvent}
        />
      ))}
    </Box>
  )
}

interface WeekDayHeaderProps {
  date: Dayjs
  maxEvents: number
  minEvents?: number
  events?: ICalendarEvent[]
  showAllDayEvents?: boolean
  hasCollapsedEvents?: boolean
  onShowAllEventChange?: (value: boolean) => void
  onCreateAllDayEvent?: (date: Dayjs) => void
}
function WeekDayHeader({
  date,
  events: data = [],
  hasCollapsedEvents,
  maxEvents,
  minEvents = 2,
  onCreateAllDayEvent,
  onShowAllEventChange,
  showAllDayEvents,
}: WeekDayHeaderProps): JSX.Element {
  const { setNodeRef } = useDroppable({
    id: date.format(),
    data: { allDayDroppable: true },
  })
  const isToday = dayjs().isSame(date, 'day')
  const events = React.useMemo(() => {
    return sortDayEvents(data)
  }, [data])
  const extraAllDayEvents = Math.max(0, events.length - minEvents)

  function handleAllDayCreateEvent(): void {
    if (onCreateAllDayEvent) onCreateAllDayEvent(date)
  }

  return (
    <Box sx={{ flex: '1 1 100%', pt: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={handleAllDayCreateEvent}
      >
        <Typography
          sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}
        >
          {date.format('ddd')}
        </Typography>
        <IconButton
          href={`/calendar/day?date=${date.format('YYYY-MM-DD')}`}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation()
          }}
          sx={{
            bgcolor: isToday ? 'primary.main' : 'inherit',
            width: 48,
            height: 48,
            fontSize: '1.85rem',
            '&:hover': isToday
              ? {
                  bgcolor: 'primary.dark',
                }
              : undefined,
          }}
        >
          {date.format('D')}
        </IconButton>
        <Box
          className='weekday-allday-droppable'
          ref={setNodeRef}
          sx={{
            width: '100%',
            minHeight: EVENT_HEIGHT / 2,
            px: 0.5,
            pt: 0.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            borderLeft:
              date.day() !== 0 ? (theme) => `1px solid ${theme.palette.divider}` : undefined,
          }}
        >
          <Collapse in={showAllDayEvents} collapsedSize={(EVENT_HEIGHT + EVENT_GAP) * minEvents}>
            {events.map((e, i) =>
              e ? (
                <WeekAllDayEvent
                  key={i}
                  event={e}
                  dayOfWeek={date.day()}
                  startDate={date.startOf('week')}
                  endDate={date.endOf('week').add(1, 'day').startOf('day')}
                />
              ) : (
                <EventPlaceholder key={i} sx={{ mb: `${EVENT_GAP}px` }} />
              ),
            )}
            {Array.from(Array(maxEvents - events.length), (_, i) => (
              <EventPlaceholder key={-i} sx={{ mb: `${EVENT_GAP}px` }} />
            ))}
          </Collapse>
          {hasCollapsedEvents && !extraAllDayEvents && !showAllDayEvents && (
            <EventPlaceholder sx={{ mb: `${EVENT_GAP}px` }} />
          )}
          {!!extraAllDayEvents && !showAllDayEvents && (
            <Chip
              size='small'
              sx={{
                justifyContent: 'flex-start',
                bgcolor: 'transparent',
                borderRadius: 1,
                height: EVENT_HEIGHT,
                mb: `${EVENT_GAP}px`,
                fontWeight: 'fontWeightBold',
              }}
              label={`${extraAllDayEvents} more`}
              onClick={(clickEvent) => {
                clickEvent.stopPropagation()
                if (onShowAllEventChange) onShowAllEventChange(!showAllDayEvents)
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

function EventPlaceholder(props: BoxProps): JSX.Element {
  return <Box height={24} width='100%' {...props} />
}
