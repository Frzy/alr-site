'use client'

import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import ScheduleView from '../Calendar/Schedule/View'
import type { IServerCalendarEvent, Member } from '@/types/common'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CalendarProvider from '@/hooks/useCalendar'
import { Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
dayjs.extend(duration)

interface HomeViewProps {
  officers?: Member[]
  events?: IServerCalendarEvent[]
}

export default function HomeView({ officers = [], events = [] }: HomeViewProps): React.ReactNode {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarProvider>
        <Grid container>
          <Grid xs={12}>
            <Box sx={{ p: 1, backgroundColor: '#272727', borderRadius: 1 }}>
              <Typography variant='h4'>Skipper&apos;s View</Typography>
              <ScheduleView events={events} duration={dayjs.duration({ days: 7 })} />
            </Box>
          </Grid>
        </Grid>
      </CalendarProvider>
    </LocalizationProvider>
  )
}
