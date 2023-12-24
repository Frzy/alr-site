'use client'

import { Box, Typography } from '@mui/material'
import { DAYS } from '@/utils/constants'
import { getDaysEvents } from '@/utils/calendar'
import { type Dayjs } from 'dayjs'
import { type MutatorOptions } from 'swr'
import { useCalendar } from '@/hooks/useCalendar'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import MobileMonthDay from './MobileDay'
import React from 'react'
import type { ICalendarEvent } from '@/types/common'

export default function MobileMonthView({
  days,
  events = [],
  firstDate,
  onMutate,
}: {
  days: number[]
  events?: ICalendarEvent[]
  firstDate: Dayjs
  onMutate?: (data: any, options?: MutatorOptions<ICalendarEvent[]>) => void
}): JSX.Element {
  const { date, setDate } = useCalendar()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Grid container columns={7} sx={{ flexShrink: 1 }}>
        {DAYS.map((day, index) => (
          <Grid
            key={day}
            xs={1}
            sx={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: (theme) => theme.palette.divider,
              borderRight: index > 0 && (index + 1) % 7 === 0 ? undefined : 'none',
              borderBottom: 'none',
              display: 'flex',
              justifyContent: 'center',
              pt: 0.25,
            }}
          >
            <Typography
              component={'span'}
              variant='button'
              color='text.secondary'
              sx={{ lineHeight: 1, fontSize: '.75rem' }}
            >
              {DAYS[index][0]}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Grid container columns={7} sx={{ flexGrow: 1 }}>
        {days.map((d) => (
          <Grid
            key={d}
            xs={1}
            sx={{
              borderColor: (theme) => theme.palette.divider,
              display: 'flex',
              justifyContent: 'center',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderTop: d < 7 ? 'none' : undefined,
              borderRight: d > 0 && (d + 1) % 7 === 0 ? undefined : 'none',
              borderBottom: 'none',
            }}
          >
            <MobileMonthDay
              date={firstDate.add(d, 'days')}
              events={getDaysEvents(events, firstDate.add(d, 'days'))}
              activeMonth={date.month()}
              selected={date.isSame(firstDate.add(d, 'days'), 'day')}
              onDateClick={setDate}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
