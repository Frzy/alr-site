import * as React from 'react'

import { getActivityLogStats } from '@/lib/activity.log'
import Grid from '@mui/material/Unstable_Grid2'
import Head from 'next/head'
import moment from 'moment'

import {
  Box,
  Typography,
  Paper,
  Divider,
  ListItem,
  List,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Container,
} from '@mui/material'

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import type { ActivityLogStats } from '@/types/common'
import Header from '@/component/header'
import { flattenBreakdown } from '@/utils/helpers'

export const getServerSideProps: GetServerSideProps<{
  stats: ActivityLogStats
  startDate: string
  endDate: string
}> = async () => {
  const now = moment()
  const startDate = moment().startOf('year')
  const endDate = moment().endOf('year')
  const stats = await getActivityLogStats(
    (l) => moment(l.date).isBetween(startDate, endDate),
    (m) => m.isActive,
  )

  return { props: { stats, startDate: startDate.format(), endDate: endDate.format() } }
}

export default function StatsPage({
  stats,
  startDate,
  endDate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const start = moment(startDate)
  const end = moment(endDate)
  const topRiders = React.useMemo(() => {
    return [...stats.entriesByMember]
      .sort((a, b) => {
        return a.breakdown.Ride.events === b.breakdown.Ride.events
          ? 0
          : a.breakdown.Ride.events < b.breakdown.Ride.events
          ? 1
          : -1
      })
      .slice(0, 5)
  }, [stats])
  const topActive = React.useMemo(() => {
    return [...stats.entriesByMember]
      .sort((a, b) => {
        return a.events === b.events ? 0 : a.events < b.events ? 1 : -1
      })
      .slice(0, 5)
  }, [stats])
  const topMiles = React.useMemo(() => {
    return [...stats.entriesByMember]
      .sort((a, b) => {
        return a.miles === b.miles ? 0 : a.miles < b.miles ? 1 : -1
      })
      .slice(0, 5)
  }, [stats])
  const topHours = React.useMemo(() => {
    return [...stats.entriesByMember]
      .sort((a, b) => {
        return a.hours === b.hours ? 0 : a.hours < b.hours ? 1 : -1
      })
      .slice(0, 5)
  }, [stats])

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Stats</title>
        <meta name='description' content='american legion riders chapter 91 activity log stats' />
      </Head>
      <Header />
      <Container maxWidth='xl'>
        <Grid container spacing={1}>
          <Grid xs={12}>
            <Paper sx={{ p: 1 }}>
              <Typography variant='h4'>Latest Log Entries</Typography>
              <Divider sx={{ my: 1 }} />
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align='right' sx={{ minWidth: 125 }}>
                        Activity Name
                      </TableCell>
                      <TableCell align='right' sx={{ minWidth: 125 }}>
                        Activity Type
                      </TableCell>
                      <TableCell align='right'>Hours</TableCell>
                      <TableCell align='right'>Miles</TableCell>
                      <TableCell align='right' sx={{ minWidth: 125 }}>
                        Entered
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.latestEntries.map((entry, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component='th' scope='row'>
                          {entry.name}
                        </TableCell>
                        <TableCell align='right'>{entry.activityName}</TableCell>
                        <TableCell align='right'>{entry.activityType}</TableCell>
                        <TableCell align='right'>{entry.hours}</TableCell>
                        <TableCell align='right'>{entry.miles}</TableCell>
                        <TableCell align='right'>
                          <Tooltip title={entry.created}>
                            <Typography variant='caption' color='text.seconday'>
                              {moment(entry.created).from(moment())}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid xs={12}>
            <Alert severity='info'>
              <Typography component='div' variant='body2' color='text.secodary'>
                All Stats gathered from logs between{' '}
                {`${start.format('MMM YYYY')} through ${end.format('MMM YYYY')}`}
              </Typography>
            </Alert>
          </Grid>
          <Grid xs={12}>
            <Paper sx={{ p: 1 }}>
              <Typography variant='h4'>Chapter Stats</Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container>
                <Grid xs={12} sm={6} md={4}>
                  <Typography variant='h6' sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    Total Participation: {stats.events.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <Typography variant='h6' sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    Total Hours: {stats.hours.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6} md={4}>
                  <Typography variant='h6' sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                    Total Miles: {stats.miles.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant='h6'>Breakdown</Typography>
                  <Divider sx={{ mt: 1 }} />
                  <Table size='small' aria-label='breakdown'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Attended</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Miles</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flattenBreakdown(stats.breakdown).map((r, index) => (
                        <TableRow key={index}>
                          <TableCell component='th' scope='row'>
                            {r.name}
                          </TableCell>
                          <TableCell>{r.events.toLocaleString()}</TableCell>
                          <TableCell>{r.hours.toLocaleString()}</TableCell>
                          <TableCell>{r.miles.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6}>
            <Paper sx={{ p: 1 }}>
              <Typography variant='h4' align='center'>
                Top 5 in Rides
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List disablePadding dense>
                {topRiders.map((r, index) => (
                  <ListItem key={index}>
                    <Box display='flex' width='100%'>
                      <Typography flexGrow={1}>{r.name}</Typography>
                      <Typography>{r.breakdown.Ride.events.toLocaleString()}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6}>
            <Paper sx={{ p: 1 }}>
              <Typography variant='h4' align='center'>
                Top 5 in Participation
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List disablePadding dense>
                {topActive.map((r, index) => (
                  <ListItem key={index}>
                    <Box display='flex' width='100%'>
                      <Typography flexGrow={1}>{r.name}</Typography>
                      <Typography>{r.events.toLocaleString()}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6}>
            <Paper sx={{ p: 1 }}>
              <Typography variant='h4' align='center'>
                Top 5 in Miles
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List disablePadding dense>
                {topMiles.map((r, index) => (
                  <ListItem key={index}>
                    <Box display='flex' width='100%'>
                      <Typography flexGrow={1}>{r.name}</Typography>
                      <Typography>{r.miles.toLocaleString()}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6}>
            <Paper sx={{ p: 1 }}>
              <Typography variant='h4' align='center'>
                Top 5 in Hours
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List disablePadding dense>
                {topHours.map((r, index) => (
                  <ListItem key={index}>
                    <Box display='flex' width='100%'>
                      <Typography flexGrow={1}>{r.name}</Typography>
                      <Typography>{r.hours.toLocaleString()}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  )
}
