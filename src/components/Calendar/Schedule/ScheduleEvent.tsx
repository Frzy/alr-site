import { useCalendar } from '@/hooks/useCalendar'
import type { ICalendarEvent } from '@/types/common'
import { getCalendarEventTypeIcon, getEventPartNumber, parseLocationString } from '@/utils/calendar'
import { Box, ButtonBase, Typography, darken } from '@mui/material'
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
    <ButtonBase
      onClick={() => {
        setEventId(event.id)
      }}
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 1,
        boxShadow: eventId === event.id ? (theme) => theme.shadows[4] : undefined,
        py: 0.5,
        px: 1,
        width: '100%',
        borderRadius: '12px',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}
        <Typography
          component='span'
          variant='body2'
          textAlign='left'
          color={event.isPastEvent ? 'text.secondary' : undefined}
          sx={{
            minWidth: { xs: 120, md: 150 },
          }}
        >
          {allDay ? 'All Day' : time}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
        <Typography
          component='span'
          variant='body2'
          textAlign='left'
          fontWeight='fontWeightBold'
          color={event.isPastEvent ? 'text.secondary' : undefined}
          sx={{ overflow: 'hidden' }}
          noWrap
        >
          {event.summary}
          {part ? ` ${part}` : null}
        </Typography>
        {location && (
          <Typography
            component='span'
            variant='body2'
            textAlign='left'
            sx={{ pl: { xs: 0, md: 1 } }}
            color={event.isPastEvent ? 'text.secondary' : undefined}
          >
            {location}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  )
}
