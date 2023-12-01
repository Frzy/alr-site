import * as React from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import Calendar from '@/component/calendar/calendar'
import Head from 'next/head'
import Header from '@/component/header'
import { Box, Toolbar } from '@mui/material'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Calendar</title>
        <meta name='description' content='American Legion Riders Chapter 91 Calendar' />
      </Head>

      <Box
        component='main'
        sx={{ height: { xs: 'calc(100vh - 80px)', lg: 'calc(100vh - 120px)' } }}
      >
        <Header />
        <Toolbar sx={{ mb: { xs: 2, lg: 7 } }} />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Calendar flexGrow={1} maxHeight='calc(100vh - 64px)' />
        </LocalizationProvider>
      </Box>
    </React.Fragment>
  )
}
