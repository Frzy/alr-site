import { useCalendar } from '@/hooks/useCalendar'
import type { ICalendarEvent } from '@/types/common'
import { getCalendarEventTypeIcon, getEventPartNumber, parseLocationString } from '@/utils/calendar'
import { Paper, Typography, darken } from '@mui/material'
import { type Dayjs } from 'dayjs'
import React from 'react'

interface ScheduleEventProps {
  event: ICalendarEvent
  date: Dayjs
}
export default function ScheduleEvent({ date, event }: ScheduleEventProps): JSX.Element {
  const { eventId, setEventId } = useCalendar()

  const { icon, allDay, time, part, location } = React.useMemo(() => {
    const allDay = event.isAllDayEvent || event.isMultipleDayEvent
    const endFormat = 'h:mma'
    const locString = event.location ? parseLocationString(event.location) : ''
    const partNum = getEventPartNumber(event, date)
    let startFormat = 'h:mm'

    if (event.startDate.format('a') !== event.endDate.format('a')) {
      startFormat = 'h:mma'
    }

    return {
      allDay,
      location: Array.isArray(locString) ? locString[0] : locString,
      part: partNum ? `(Day ${partNum}/${event.dayTotal})` : undefined,
      icon: getCalendarEventTypeIcon(event.eventType, {
        sx: { color: event.isPastEvent ? darken(event.color as string, 0.35) : event.color },
      }),
      time: !allDay
        ? `${event.startDate.format(startFormat)} \u2013 ${event.endDate.format(endFormat)}`
        : '',
    }
  }, [event, date])

  return (
    <Paper
      elevation={event.id === eventId ? 8 : 0}
      onClick={() => {
        setEventId(event.id)
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.5,
        px: 1,
        borderRadius: '12px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      {icon}
      <Typography
        component='span'
        variant='body2'
        color={event.isPastEvent ? 'text.secondary' : undefined}
        sx={{
          minWidth: { xs: 125, md: 150 },
        }}
      >
        {allDay ? 'All Day' : time}
      </Typography>
      <Typography
        component='span'
        variant='body2'
        color={event.isPastEvent ? 'text.secondary' : undefined}
      >
        <Typography component='span' variant='body2' fontWeight='fontWeightBold'>
          {event.summary}
          {part ? ` ${part}` : null}
        </Typography>
        {location && (
          <Typography component='span' variant='body2' sx={{ pl: 1 }}>
            {location}
          </Typography>
        )}
      </Typography>
    </Paper>
  )
}
