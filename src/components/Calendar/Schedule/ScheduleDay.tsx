import type { ICalendarEvent } from '@/types/common'
import { Box, IconButton, ListItem, Typography, type ListItemProps } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import ScheduleEvent from './ScheduleEvent'

interface ScheduleDayProps extends ListItemProps {
  date: Dayjs
  events: ICalendarEvent[]
}

export default function ScheduleDay({ date, events, ...other }: ScheduleDayProps): JSX.Element {
  const isToday = date.isSame(dayjs(), 'day')

  return (
    <ListItem
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: { xs: 'column', md: 'row' },
        py: 0.5,
      }}
      disablePadding
      {...other}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          alignSelf: 'flex-start',
        }}
      >
        <IconButton
          sx={{
            width: 40,
            height: 40,
            fontSize: '1.5rem',
            backgroundColor: (theme) => (isToday ? theme.palette.primary.main : undefined),
            '&:hover': {
              backgroundColor: (theme) => (isToday ? theme.palette.primary.dark : undefined),
            },
          }}
          href={`/calendar/day?date=${date.format('YYYY-MM-DD')}`}
        >
          {date.format('D')}
        </IconButton>
        <Typography
          sx={{
            color: 'text.secondary',
            minWidth: 95,
          }}
        >
          {date.format('MMM, ddd')}
        </Typography>
      </Box>
      <Box sx={{ flex: '1 1 100%', width: '100%' }}>
        {events.map((e) => (
          <ScheduleEvent key={e.id} event={e} date={date} />
        ))}
      </Box>
    </ListItem>
  )
}

export function MobileScheduleDay({ date, events, ...other }: ScheduleDayProps): JSX.Element {
  const isToday = date.isSame(dayjs(), 'day')

  return (
    <ListItem sx={{ alignItems: 'flex-start', flexDirection: 'column' }} {...other}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          sx={{
            width: 40,
            height: 40,
            fontSize: '1.5rem',
            backgroundColor: (theme) => (isToday ? theme.palette.primary.main : undefined),
            '&:hover': {
              backgroundColor: (theme) => (isToday ? theme.palette.primary.dark : undefined),
            },
          }}
          href={`/calendar/day?date=${date.format('YYYY-MM-DD')}`}
        >
          {date.format('D')}
        </IconButton>
        <Typography
          sx={{
            color: 'text.secondary',
            minWidth: 95,
          }}
        >
          {date.format('MMM, ddd')}
        </Typography>
      </Box>
      <Box sx={{ flex: '1 1 100%' }}>
        {events.map((e) => (
          <ScheduleEvent key={e.id} event={e} date={date} />
        ))}
      </Box>
    </ListItem>
  )
}
