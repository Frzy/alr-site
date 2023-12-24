import React from 'react'

import { Box, Chip, IconButton, Typography, alpha, darken } from '@mui/material'
import { EVENT_TYPE } from '@/utils/constants'
import dayjs, { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'
import RideIcon from '@mui/icons-material/TwoWheeler'
import MeetingIcon from '@mui/icons-material/Groups'
import EventIcon from '@mui/icons-material/LocalActivity'
import OtherIcon from '@mui/icons-material/Event'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { sortDayEvents } from '@/utils/calendar'

interface MonthDayProps {
  activeMonth: number
  date: Dayjs
  events: ICalendarEvent[]
  selected?: boolean
  onDateClick?: (date: Dayjs) => void
  onEventClick?: (event: ICalendarEvent) => void
}

const DAY_ICON_WIDTH = { width: 32, height: 32 }
const MONTH_DAY_ICON_WIDTH = { width: 64, height: 32 }

function MonthDayEvent({
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
    switch (event.eventType) {
      case EVENT_TYPE.UNOFFICAL_RIDE:
      case EVENT_TYPE.RIDE:
        return <RideIcon />
      case EVENT_TYPE.MEETING:
        return <MeetingIcon />
      case EVENT_TYPE.EVENT:
        return <EventIcon />
      default:
        return <OtherIcon />
    }
  }, [event])
  const label = React.useMemo(() => {
    if (event.isAllDayEvent) return event.summary

    return `${event.startDate.format('ha')} ${event.summary}`
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
        // transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        border: 'none',
        borderRadius: 0.75,
        bgcolor: isDragging
          ? 'green'
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
        gap: 1,
        mx: 0.5,
        px: 0.5,
        '&:hover': {
          bgcolor:
            !isDisabled && event.isAllDayEvent ? darken(event.color as string, 0.25) : undefined,
        },
        '& .MuiChip-icon': {
          color: !event.isAllDayEvent ? event.color : undefined,
        },
      }}
      onClick={
        !isDisabled
          ? () => {
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

export default function MonthDay({
  date,
  activeMonth,
  onDateClick,
  selected,
  events,
  onEventClick,
}: MonthDayProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: date.format(),
  })
  const isFirstOfMonth = date.get('date') === 1
  const isActiveMonth = date.month() === activeMonth
  function handleDateClick(): void {
    if (onDateClick) onDateClick(date)
  }

  return (
    <Box
      ref={setNodeRef}
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
      {sortDayEvents(events, date).map((e, index) => {
        if (e)
          return (
            <MonthDayEvent key={e.id} event={e} onEventClick={onEventClick} disabled={isOver} />
          )

        return <EventPlaceholder key={index} />
      })}
    </Box>
  )
}
