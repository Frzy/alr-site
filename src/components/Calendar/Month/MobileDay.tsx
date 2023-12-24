import React from 'react'

import { Box, Chip, IconButton, Typography, alpha, darken } from '@mui/material'
import { EVENT_TYPE } from '@/utils/constants'
import { sortDayEvents } from '@/utils/calendar'
import { type Dayjs } from 'dayjs'
import EventIcon from '@mui/icons-material/LocalActivity'
import MeetingIcon from '@mui/icons-material/Groups'
import OtherIcon from '@mui/icons-material/Event'
import RideIcon from '@mui/icons-material/TwoWheeler'
import type { ICalendarEvent } from '@/types/common'

interface MobileMonthDayProps {
  activeMonth: number
  date: Dayjs
  events: ICalendarEvent[]
  selected?: boolean
  onDateClick?: (date: Dayjs) => void
  onEventClick?: (event: ICalendarEvent) => void
}

const DAY_ICON_WIDTH = { width: 32, height: 32 }
const MONTH_DAY_ICON_WIDTH = { width: 64, height: 32 }

function MobileMonthDayEvent({
  disabled,
  event,
  onEventClick,
}: {
  disabled?: boolean
  event: ICalendarEvent
  onEventClick?: (event: ICalendarEvent) => void
}): JSX.Element {
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

  return (
    <Chip
      size='small'
      label={label}
      icon={icon}
      variant={event.isAllDayEvent ? 'filled' : 'outlined'}
      sx={{
        // transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        border: 'none',
        borderRadius: 0.75,
        bgcolor: event.isAllDayEvent
          ? event.isPastEvent
            ? alpha(event.color as string, 0.15)
            : event.color
          : 'inherit',
        color: (theme) =>
          event.isPastEvent
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
            !disabled && event.isAllDayEvent ? darken(event.color as string, 0.25) : undefined,
        },
        '& .MuiChip-icon': {
          color: !event.isAllDayEvent ? event.color : undefined,
        },
      }}
      onClick={
        !disabled
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

export default function MobileMonthDay({
  date,
  activeMonth,
  onDateClick,
  selected,
  events,
  onEventClick,
}: MobileMonthDayProps): JSX.Element {
  const isFirstOfMonth = date.get('date') === 1
  const isActiveMonth = date.month() === activeMonth
  function handleDateClick(): void {
    if (onDateClick) onDateClick(date)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pt: 0.5,
        width: '100%',
        gap: '2px',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            color: isActiveMonth ? (selected ? 'primary.main' : 'text.primary') : 'text.secondary',
            fontSize: '.75rem',
            lineHeight: 1,
          }}
        >
          {isFirstOfMonth ? date.format('MMM D') : date.format('D')}
        </Typography>
      </Box>
      {sortDayEvents(events, date).map((e, index) => {
        if (e) return <MobileMonthDayEvent key={e.id} event={e} onEventClick={onEventClick} />

        return <EventPlaceholder key={index} />
      })}
    </Box>
  )
}
