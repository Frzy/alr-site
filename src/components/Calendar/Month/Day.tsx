import React from 'react'
import { Box, Chip, IconButton, Typography, darken } from '@mui/material'
import { EVENT_TYPE } from '@/utils/constants'
import { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'
import RideIcon from '@mui/icons-material/TwoWheeler'
import MeetingIcon from '@mui/icons-material/Groups'
import EventIcon from '@mui/icons-material/LocalActivity'
import OtherIcon from '@mui/icons-material/Event'

interface MonthDayProps {
  date: Dayjs
  selected?: boolean
  activeMonth: number
  events: ICalendarEvent[]
  onDateClick?: (date: Dayjs) => void
}

const DAY_ICON_WIDTH = { width: 32, height: 32 }
const MONTH_DAY_ICON_WIDTH = { width: 64, height: 32 }

function MonthDayEvent({ event }: { event: ICalendarEvent }): JSX.Element {
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
        border: 'none',
        borderRadius: 0.75,
        bgcolor: event.isAllDayEvent ? event.color : 'inherit',
        color: (theme) =>
          event.isAllDayEvent ? theme.palette.getContrastText(event.color as string) : 'inherit',
        justifyContent: 'flex-start',
        gap: 1,
        mx: 0.5,
        px: 0.5,
        '&:hover': {
          bgcolor: event.isAllDayEvent ? darken(event.color as string, 0.25) : undefined,
        },
        '& .MuiChip-icon': {
          color: !event.isAllDayEvent ? event.color : undefined,
        },
      }}
      onClick={() => {
        console.log('here')
      }}
    />
  )
}

export default function MonthDay({
  date,
  activeMonth,
  onDateClick,
  selected,
  events,
}: MonthDayProps): JSX.Element {
  const isFirstOfMonth = date.get('date') === 1
  const isActiveMonth = date.month() === activeMonth
  function handleDateClick(): void {
    if (onDateClick) onDateClick(date)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', pt: 0.5, width: '100%', gap: '2px' }}>
      <Box sx={{ textAlign: 'center' }}>
        <IconButton
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
      {events.map((e) => (
        <MonthDayEvent key={e.id} event={e} />
      ))}
    </Box>
  )
}
