import React from 'react'

import { Box, ButtonBase, Typography } from '@mui/material'
import { sortDayEvents } from '@/utils/calendar'
import { type Dayjs } from 'dayjs'

import type { ICalendarEvent } from '@/types/common'

interface MobileMonthDayProps {
  activeMonth: number
  date: Dayjs
  events: ICalendarEvent[]
  selected?: boolean
  onDateClick?: (date: Dayjs) => void
  onEventClick?: (event: ICalendarEvent) => void
}

function MobileMonthDayEvent({ event }: { event: ICalendarEvent }): JSX.Element {
  return (
    <Typography
      variant='caption'
      sx={{
        mx: '2px',
        px: '2px',
        bgcolor: event.color,
        borderRadius: 0.5,
        fontSize: '.65rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        width: 'calc(100% - 4px)',
      }}
    >
      {event.summary}
    </Typography>
  )
}

function EventPlaceholder(): JSX.Element {
  return <Box height={17.27} width='100%' />
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

  return (
    <ButtonBase
      component='div'
      onClick={() => {
        const queryParams = new URLSearchParams({ date: date.format('YYYY-MM-DD') })
        window.location.href = `/calendar/day?${queryParams.toString()}`
      }}
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        pt: 0.5,
        width: '100%',
        gap: '2px',
      }}
    >
      <Box sx={{ textAlign: 'center', width: '100%' }}>
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
        if (e) return <MobileMonthDayEvent key={e.id} event={e} />

        return <EventPlaceholder key={index} />
      })}
    </ButtonBase>
  )
}
