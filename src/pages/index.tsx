import * as React from 'react'

import { Grid, Paper } from '@mui/material'
import ActivityLogStats from '@/component/activity.log.stats'
import CalendarSchedule from '@/component/calendar/schedule'
import Head from 'next/head'
import MembershipStats from '@/component/membership.stats'
import moment from 'moment'
import Officers from '@/component/officers'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91</title>
        <meta name='description' content='American Legion Riders Chapter 91 Portal' />
      </Head>

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Paper sx={{ p: 1 }}>
            <CalendarSchedule
              date={moment()}
              title='Upcoming Events'
              endDate={moment().add(2, 'week').endOf('day')}
              disableCurrentTimeTracker
              fetchOptions={{
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Officers />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 1 }}>
            <MembershipStats />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 1 }}>
            <ActivityLogStats />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}
