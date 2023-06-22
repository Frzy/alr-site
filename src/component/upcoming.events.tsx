import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import moment from 'moment'
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'
import { green, pink, orange } from '@mui/material/colors'
import type { calendar_v3 } from 'googleapis'

import RideIcon from '@mui/icons-material/TwoWheeler'
import EventIcon from '@mui/icons-material/Event'
import MeetingIcon from '@mui/icons-material/Groups'

const fetcher: Fetcher<calendar_v3.Schema$Events, string> = async (url: string) => {
  const queryParams = new URLSearchParams({
    start: moment().startOf('day').toISOString(),
    end: moment().add(6, 'days').endOf('day').toISOString(),
  })
  const calendarEvents = await fetch(`${url}?${queryParams.toString()}`)

  return await calendarEvents.json()
}

export default function UpcomingEvents() {
  const { data, error, isLoading } = useSWR('/api/calendarEvents', fetcher)
  const events = data?.items || []
  const today = moment().startOf('day')
  const nextWeek = moment().add(6, 'days').endOf('day')

  function getCalendarEventAvatar(summary: string = '') {
    if (summary.indexOf('ride') !== -1)
      return (
        <Avatar sx={{ bgcolor: orange[500] }}>
          <RideIcon />
        </Avatar>
      )

    if (summary.indexOf('meeting') !== -1)
      return (
        <Avatar sx={{ bgcolor: green[500] }}>
          <MeetingIcon />
        </Avatar>
      )

    return (
      <Avatar sx={{ bgcolor: pink[500] }}>
        <EventIcon />
      </Avatar>
    )
  }

  function getTimeString(
    start?: calendar_v3.Schema$EventDateTime,
    end?: calendar_v3.Schema$EventDateTime,
  ) {
    let sDate
    let eDate

    if (!start) return ''

    if (start && !end) {
      if (start.date) return (sDate = moment(start.date).startOf('day').format('dddd, MMMM DD'))
      if (start.dateTime) return moment(start.dateTime).format('dddd, MMMM DD ⋅ h:mm')
    }

    if (start.date && end?.date) {
      sDate = moment(start.date).startOf('day')
      // Subtract one day because this is an exclusive date not inclusive
      eDate = moment(end.date).startOf('day').subtract(1, 'day')

      if (sDate.diff(eDate, 'days')) {
        return `${sDate.format('dddd, MMMM DD')} - ${eDate.format('dddd, MMMM DD')}`
      }

      return `${sDate.format('dddd, MMMM DD')}`
    } else if (start.dateTime && end?.dateTime) {
      sDate = moment(start.dateTime)
      eDate = moment(end.dateTime)

      if (sDate.diff(eDate, 'days')) {
        return `${sDate.format('dddd, MMMM DD ⋅ h:mma')} – ${eDate.format('dddd, MMMM DD ⋅ h:mma')}`
      }

      return `${sDate.format('dddd, MMMM DD ⋅ h:mm')} – ${eDate.format('h:mma')}`
    }

    return ''
  }

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )

  if (!events.length)
    return (
      <Box minHeight={350} display='flex' alignItems='center' justifyContent='center'>
        <Typography fontWeight='fontWeightBold' variant='h5'>
          No upcoming events scheduled
        </Typography>
      </Box>
    )

  return (
    <Box>
      <Typography sx={{ p: 1 }} variant='h4'>
        Upcoming Events
      </Typography>
      <Divider />
      <List
        sx={{
          px: 1,
          width: '100%',
        }}
      >
        {events.map((event, index) => (
          <React.Fragment key={event.id}>
            <ListItem alignItems='center' disablePadding>
              <ListItemAvatar>
                {getCalendarEventAvatar(event.summary?.toLowerCase())}
              </ListItemAvatar>
              <ListItemText
                primary={event.summary}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  <React.Fragment>
                    <Typography component='p' variant='body2' color='text.secondary'>
                      {getTimeString(event.start, event.end)}
                    </Typography>
                    {event.description && (
                      <Typography
                        component='p'
                        variant='caption'
                        color='text.secondary'
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    )}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < events.length - 1 && <Divider variant='middle' />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}
