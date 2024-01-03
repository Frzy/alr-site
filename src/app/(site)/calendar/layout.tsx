'use client'

import React from 'react'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { CALENDAR_DRAWER_WIDTH, type CALENDAR_VIEW } from '@/utils/constants'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import CalendarHeader from '@/components/Calendar/Header'
import CalendarProvider from '@/hooks/useCalendar'
import Notifier from '@/components/Notifier'

export default function CalendarView({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname()
  const calendarView = pathname.slice(pathname.lastIndexOf('/') + 1)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CalendarProvider view={calendarView as CALENDAR_VIEW}>
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
        <Notifier />
      </CalendarProvider>
    </LocalizationProvider>
  )
}
