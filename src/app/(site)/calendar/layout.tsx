'use client'

import React from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { CALENDAR_DRAWER_WIDTH } from '@/utils/constants'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import CalendarHeader from '@/components/Calendar/Header'
import CalendarProvider from '@/hooks/useCalendar'
import dayjs from 'dayjs'

export default function CalendarView({ children }: { children: React.ReactNode }): JSX.Element {
  const searchParams = useSearchParams()
  const dateString = searchParams.get('date')

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarProvider date={dateString ? dayjs(dateString, 'M/D/YYYY') : dayjs()}>
        <CalendarHeader />
        <Box
          component='main'
          sx={{
            flexGrow: 1,
            ml: { xs: 0, md: `${CALENDAR_DRAWER_WIDTH}px` },
            mt: { xs: '56px', sm: '64px' },
            position: 'relative',
            height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          }}
        >
          {children}
        </Box>
      </CalendarProvider>
    </LocalizationProvider>
  )
}
