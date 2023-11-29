import * as React from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import Calendar from '@/component/calendar/calendar'
import Head from 'next/head'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Calendar</title>
        <meta name='description' content='American Legion Riders Chapter 91 Calendar' />
      </Head>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Calendar flexGrow={1} maxHeight='calc(100vh - 64px)' />
      </LocalizationProvider>
    </React.Fragment>
  )
}
