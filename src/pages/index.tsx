import * as React from 'react'
import Head from 'next/head'
import Header from '@/component/header'
import { Container, Grid, Paper, Typography } from '@mui/material'
import Officers from '@/component/officers'
import CalendarSchedule from '@/component/calendar/schedule'
import moment from 'moment'
import MembershipStats from '@/component/membership.stats'
import ActivityLogStats from '@/component/activity.log.stats'

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Dashboard</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/images/alr-logo.png' />
      </Head>
      <main>
        <Header />
        <Container maxWidth='xl' sx={{pb: 1}}>
          <Grid container spacing={1} sx={{ pt: 2 }}>
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
        </Container>
      </main>
    </React.Fragment>
  )
}
