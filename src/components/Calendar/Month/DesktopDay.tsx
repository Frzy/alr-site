import React from 'react'

import { Box, Chip, IconButton, Typography, alpha, darken } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { getCalendarEventTypeIcon, sortDayEvents } from '@/utils/calendar'

interface DesktopMonthDayProps {
  activeMonth: number
  date: Dayjs
  events: ICalendarEvent[]
  selected?: boolean
  onDateClick?: (date: Dayjs) => void
  onEventClick?: (event: ICalendarEvent) => void
  onEventCreate?: (date: Dayjs) => void
}

const DAY_ICON_WIDTH = { width: 32, height: 32 }
const MONTH_DAY_ICON_WIDTH = { width: 64, height: 32 }

function DesktopMonthDayEvent({
  disabled,
  event,
  onEventClick,
}: {
  disabled?: boolean
  event: ICalendarEvent
  onEventClick?: (event: ICalendarEvent) => void
}): JSX.Element {
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: event?.id ?? '' })
  const isPastEvent = dayjs().isAfter(event.endDate)
  const icon = React.useMemo(() => {
    return getCalendarEventTypeIcon(event.eventType)
  }, [event])
  const label = React.useMemo(() => {
    if (event.isAllDayEvent) return event.summary ? event.summary : '(No Title)'

    const format = event.startDate.minute() === 0 ? 'ha' : 'h:mma'

    return `${event.startDate.format(format)} ${event.summary ? event.summary : '(No Title)'}`
  }, [event])
  const isDisabled = isDragging || disabled

  return (
    <Chip
      ref={setNodeRef}
      {...listeners}
      size='small'
      label={label}
      icon={icon}
      variant={event.isAllDayEvent ? 'filled' : 'outlined'}
      sx={{
        touchAction: 'none',
        border: 'none',
        borderRadius: 0.75,
        bgcolor: isDragging
          ? 'rgba(0, 255, 0, 0.25)'
          : event.isAllDayEvent
            ? isPastEvent
              ? alpha(event.color as string, 0.15)
              : event.color
            : 'inherit',
        color: (theme) =>
          isPastEvent
            ? 'text.secondary'
            : event.isAllDayEvent
              ? theme.palette.getContrastText(event.color as string)
              : 'inherit',
        justifyContent: 'flex-start',
        gap: '6px',
        mx: 0.5,
        px: 0.5,
        '&:hover': {
          bgcolor:
            !isDisabled && event.isAllDayEvent ? darken(event.color as string, 0.25) : undefined,
        },
        '& .MuiChip-icon': {
          color: !event.isAllDayEvent ? event.color : undefined,
          ml: 0,
        },
        '& .MuiChip-label': {
          pl: '2px',
        },
      }}
      onClick={
        !isDisabled
          ? (clickEvent) => {
              clickEvent.stopPropagation()
              if (onEventClick) onEventClick(event)
            }
          : undefined
      }
    />
  )
}

function EventPlaceholder(): JSX.Element {
  return <Box height={24} width='100%' />
}

export default function DesktopMonthDay({
  date,
  activeMonth,
  onDateClick,
  selected,
  events,
  onEventClick,
  onEventCreate,
}: DesktopMonthDayProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: date.format(),
  })
  const isFirstOfMonth = date.get('date') === 1
  const isActiveMonth = date.month() === activeMonth
  function handleDateClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()

    if (onDateClick) onDateClick(date)
  }

  return (
    <Box
      ref={setNodeRef}
      onClick={(event) => {
        if (onEventCreate) onEventCreate(date)
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 0.5,
        width: '100%',
        gap: '2px',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <IconButton
          disabled={isOver}
          onClick={handleDateClick}
          color={selected ? 'primary' : 'default'}
          sx={{ ...(isFirstOfMonth ? MONTH_DAY_ICON_WIDTH : DAY_ICON_WIDTH) }}
        >
          <Typography
            sx={{
              color: isActiveMonth
                ? selected
                  ? 'primary.main'
                  : 'text.primary'
                : 'text.secondary',
              fontSize: '.95rem',
            }}
          >
            {isFirstOfMonth ? date.format('MMM D') : date.format('D')}
          </Typography>
        </IconButton>
      </Box>
      {sortDayEvents(events).map((e, index) => {
        if (e)
          return (
            <DesktopMonthDayEvent
              key={e.id}
              event={e}
              onEventClick={onEventClick}
              disabled={isOver}
            />
          )

        return <EventPlaceholder key={index} />
      })}
    </Box>
  )
}
