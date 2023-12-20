'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { useCalendar } from '@/hooks/useCalendar'
import MonthDay from './Day'
import useSWR from 'swr'
import type { ICalendarEvent } from '@/types/common'
import dayjs, { type Dayjs } from 'dayjs'
import { fetchCalendarEventsBetweenDates } from '@/utils/calendar'

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function MonthView(): JSX.Element {
  const { date, setDate } = useCalendar()
  const firstDate = React.useMemo(() => {
    return date.startOf('month').day(0)
  }, [date])
  const lastDate = React.useMemo(() => {
    return date.endOf('month').day(7)
  }, [date])
  const totalDays = React.useMemo(() => lastDate.diff(firstDate, 'days'), [firstDate, lastDate])
  const days = React.useMemo(() => Array.from({ length: totalDays }, (_, i) => i), [totalDays])
  const { data } = useSWR(
    `${firstDate.format()}|${lastDate.format()}`,
    fetchCalendarEventsBetweenDates,
  )

  function getDaysEvents(day: Dayjs): ICalendarEvent[] {
    if (data) {
      return data.filter((event) => {
        const start = dayjs(event.startDate).startOf('day')
        const end = dayjs(event.endDate).endOf('day')

        return day.isBetween(start, end, 'day', '[]')
      })
    }

    return []
  }

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
            }}
          >
            <Typography component={'span'} variant='button' color='text.secondary'>
              {DAYS[index]}
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
            <MonthDay
              date={firstDate.add(d, 'days')}
              events={getDaysEvents(firstDate.add(d, 'days'))}
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
