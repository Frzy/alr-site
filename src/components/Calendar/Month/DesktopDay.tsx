import React from 'react'
import { Box, Chip, IconButton, Typography, darken, lighten } from '@mui/material'
import { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { getCalendarEventTypeIcon, sortDayEvents } from '@/utils/calendar'
import EventMenu from '../EventMenu'

interface DesktopMonthDayProps {
  activeMonth: number
  date: Dayjs
  events: ICalendarEvent[]
  selected?: boolean
  maxEvents?: number
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
  const timedEvent = !event.isAllDayEvent && !event.isMultipleDayEvent
  const isDisabled = isDragging || disabled

  const { backgroundColor, hoverColor, textColor, iconColor, icon, label } = React.useMemo(() => {
    const allDayEvent = event.isAllDayEvent || event.isMultipleDayEvent
    const icon = getCalendarEventTypeIcon(event.eventType)
    let backgroundColor: string = event.color
    let hoverColor: string | undefined
    let textColor: string = event.textColor
    let iconColor: string | undefined
    let label = event.summary

    if (isDragging) {
      backgroundColor = 'rgba(0, 255, 0, 0.25)'
    } else if (allDayEvent && event.isPastEvent) {
      hoverColor = darken(backgroundColor, 0.35)
      backgroundColor = darken(backgroundColor, 0.75)
      textColor = 'text.secondary'
    } else if (allDayEvent) {
      hoverColor = lighten(backgroundColor, 0.25)
    } else if (!allDayEvent) {
      backgroundColor = 'inherit'
      textColor = event.isPastEvent ? 'text.secondary' : 'text.primary'
      iconColor = event.color
    }

    if (event.isAllDayEvent) {
      label = event.summary ? event.summary : '(No Title)'
    } else {
      const format = event.startDate.minute() === 0 ? 'ha' : 'h:mma'
      label = `${event.startDate.format(format)} ${event.summary ? event.summary : '(No Title)'}`
    }

    return { backgroundColor, hoverColor, textColor, icon, iconColor, label }
  }, [event, isDragging])

  return (
    <Chip
      ref={setNodeRef}
      {...listeners}
      size='small'
      label={label}
      icon={icon}
      variant={!timedEvent ? 'filled' : 'outlined'}
      sx={{
        touchAction: 'none',
        border: 'none',
        mb: '2px',
        borderRadius: 0.75,
        backgroundColor,
        color: textColor,
        justifyContent: 'flex-start',
        width: '100%',
        gap: '6px',
        px: 0.5,
        '&:hover': {
          bgcolor: hoverColor,
        },
        '& .MuiChip-icon': {
          color: iconColor,
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
  return <Box height={24} width='100%' mb='2px' />
}

function MoreEventButton({ numOfEvents, onClick }: { numOfEvents: number, onClick: (event: React.MouseEvent<HTMLDivElement>) => void }): JSX.Element {
  return (
    <Chip label={`${numOfEvents} More`} onClick={onClick} size='small' sx={{
      touchAction: 'none',
      border: 'none',
      mb: '2px',
      borderRadius: 0.75,
      justifyContent: 'flex-start',
      backgroundColor: 'inherit',
      px: 0.5,
    }} />
  )
}

export default function DesktopMonthDay({
  date,
  activeMonth,
  selected,
  events: data,
  maxEvents = Infinity,
  onEventClick,
  onEventCreate,
}: DesktopMonthDayProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: date.format(),
  })
  const events = React.useMemo(() => {
    return sortDayEvents(data)
  }, [data])
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const isFirstOfMonth = date.get('date') === 1
  const isActiveMonth = date.month() === activeMonth

  function handleShowMoreEvents(clickEvent: React.MouseEvent<HTMLDivElement>): void {
    clickEvent.stopPropagation()
    if (clickEvent.target) setAnchorEl(clickEvent.target as Element)
  }

  function handleEventMenuClose(): void {
    setAnchorEl(null)
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
          href={`/calendar/day?date=${date.format('YYYY-MM-DD')}`}
          onClick={(event) => {
            event.stopPropagation()
          }}
          color={selected ? 'primary' : 'default'}
          sx={{ ...(isFirstOfMonth ? MONTH_DAY_ICON_WIDTH : DAY_ICON_WIDTH) }}
        >
          <Typography
            sx={{
              color: isActiveMonth
                ? selected
                  ? 'primary.main'
                  : 'text.primary'
                : 'rgba(255, 255, 255, 0.25)',
              fontSize: '.95rem',
            }}
          >
            {isFirstOfMonth ? date.format('MMM D') : date.format('D')}
          </Typography>
        </IconButton>
      </Box>
      <Box sx={{ px: 0.5 }}>
        {events.slice(0, maxEvents).map((e, index) => {
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
        {maxEvents < events.length && (
          <MoreEventButton numOfEvents={events.length - maxEvents} onClick={handleShowMoreEvents} />
        )}
      </Box>
      {maxEvents < events.length && (
        <EventMenu events={events.filter(Boolean) as ICalendarEvent[]} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleEventMenuClose} />
      )}
    </Box>
  )
}
