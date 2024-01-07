import type { ICalendarEvent } from '@/types/common'
import { sortDayEvents } from '@/utils/calendar'
import { useDroppable } from '@dnd-kit/core'
import { Box, type BoxProps, Chip, Collapse, IconButton, Typography } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import React from 'react'
import CalendarAllDayEvent from '../AllDayEvent'
import { useCalendar } from '@/hooks/useCalendar'

interface WeekDayHeaderProps {
  date: Dayjs
  events?: ICalendarEvent[]
  gap?: number
  hasCollapsedEvents?: boolean
  height?: number
  highlightedEvent?: ICalendarEvent | null
  maxEvents: number
  minEvents?: number
  showAllDayEvents?: boolean
  onShowAllEventChange?: (value: boolean) => void
  onCreateAllDayEvent?: (date: Dayjs) => void
  onEventClick?: (event: ICalendarEvent) => void
  onEventOut?: (event: ICalendarEvent) => void
  onEventOver?: (event: ICalendarEvent) => void
}
export default function WeekHeaderDay({
  date,
  events: data = [],
  gap = 2,
  hasCollapsedEvents,
  height = 24,
  highlightedEvent,
  maxEvents,
  minEvents = 2,
  showAllDayEvents,
  onCreateAllDayEvent,
  onEventClick,
  onShowAllEventChange,
  onEventOut,
  onEventOver,
}: WeekDayHeaderProps): JSX.Element {
  const { date: selectedDate } = useCalendar()
  const { setNodeRef } = useDroppable({
    id: date.format(),
    data: { allDayDroppable: true },
  })
  const isToday = dayjs().isSame(date, 'day')
  const isSelected = selectedDate.isSame(date, 'day')
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
            width: 48,
            height: 48,
            fontSize: '1.85rem',
            backgroundColor: isToday ? 'primary.main' : 'inherit',
            color: !isToday && isSelected ? 'primary.main' : undefined,
            '&:hover': isToday
              ? {
                  backgroundColor: 'primary.dark',
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
            minHeight: height / 2,
            px: 0.5,
            pt: 0.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            borderLeft:
              date.day() !== 0 ? (theme) => `1px solid ${theme.palette.divider}` : undefined,
          }}
        >
          <Collapse in={showAllDayEvents} collapsedSize={(height + gap) * minEvents}>
            {events.map((e, i) =>
              e ? (
                // <WeekAllDayEvent
                //   key={i}
                //   event={e}
                //   dayOfWeek={date.day()}
                //   startDate={date.startOf('week')}
                //   endDate={date.endOf('week').add(1, 'day').startOf('day')}
                // />
                <CalendarAllDayEvent
                  key={e.id}
                  event={e}
                  selected={highlightedEvent?.id === e.id}
                  draggable
                  onClick={onEventClick}
                  onMouseOver={() => {
                    if (onEventOver) onEventOver(e)
                  }}
                  onMouseOut={() => {
                    if (onEventOut) onEventOut(e)
                  }}
                  hasLeftArrow={e.startDate.isBefore(date)}
                  hasRightArrow={
                    e.isAllDayEvent
                      ? e.endDate.isAfter(date.add(1, 'day').startOf('day'))
                      : e.endDate.isAfter(date.endOf('day'))
                  }
                />
              ) : (
                <EventPlaceholder key={i} sx={{ mb: `${gap}px` }} />
              ),
            )}
            {Array.from(Array(maxEvents - events.length), (_, i) => (
              <EventPlaceholder key={-i} sx={{ mb: `${gap}px` }} />
            ))}
          </Collapse>
          {hasCollapsedEvents && !extraAllDayEvents && !showAllDayEvents && (
            <EventPlaceholder sx={{ mb: `${gap}px` }} />
          )}
          {!!extraAllDayEvents && !showAllDayEvents && (
            <Chip
              size='small'
              sx={{
                justifyContent: 'flex-start',
                bgcolor: 'transparent',
                borderRadius: 1,
                height,
                mb: `${gap}px`,
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
