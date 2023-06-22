import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import moment, { Moment } from 'moment'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  BoxProps,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
  Stack,
  useMediaQuery,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'

import type { calendar_v3 } from 'googleapis'
import { CALENDAR_VIEW, CalendarState } from './calendar'
import { getCalendarEventFromGoogleEvent } from '@/utils/helpers'
import { ICalendarEvent } from './calendar.timeline'
import { ENDPOINT } from '@/utils/constants'
import CalendarDayDialog from './calendar.month.day.dialog'

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const CHIP_HEIGHT = 20

const fetcher: Fetcher<ICalendarEvent[], string[]> = async (args) => {
  const [url, queryParams] = args
  const fullUrl = queryParams ? `${url}?${queryParams}` : url
  const response = await fetch(fullUrl)

  const data = (await response.json()) as calendar_v3.Schema$Events

  return getCalendarEventFromGoogleEvent(data.items)
}

type DayDialogState = {
  day: Moment
  events: ICalendarEvent[]
}

type MonthCalendarProps = {
  date: Moment
  onCalendarChange?: (state: CalendarState) => void
  onCalendarCreateEvent?: (date: Moment) => void
  onCalendarEventClick?: (event: ICalendarEvent) => void
} & BoxProps

export default function MonthCalendar({
  date,
  onCalendarChange,
  onCalendarCreateEvent,
  onCalendarEventClick,
  sx,
  ...boxProps
}: MonthCalendarProps) {
  const theme = useTheme()
  const isTiny = useMediaQuery(theme.breakpoints.down('sm'))
  const firstDate = React.useMemo(() => {
    return moment(date).startOf('month').day(0)
  }, [date])
  const lastDate = React.useMemo(() => {
    return moment(date).endOf('month').day(7)
  }, [date])
  const queryParams = React.useMemo(() => {
    const data = {
      start: firstDate.format(),
      end: lastDate.format(),
    }
    const searchParams = new URLSearchParams(data)

    return searchParams.toString()
  }, [firstDate, lastDate])
  const numOfWeeks = React.useMemo(() => lastDate.diff(firstDate, 'weeks'), [firstDate, lastDate])
  const { data: events, isLoading } = useSWR([ENDPOINT.EVENTS, queryParams], fetcher, {
    fallbackData: [],
  })
  const [dayDialog, setDayDialog] = React.useState<DayDialogState>()

  function getCalendarDayEvents(date: Moment) {
    return events.filter((e) => {
      const isMultiDay = e.endDate.diff(e.startDate, 'day') > 1

      if (isMultiDay) e.endDate.subtract(1, 'day')

      if (isMultiDay)
        return (
          date.isSame(e.startDate, 'day') ||
          date.isBetween(e.startDate, e.endDate, 'day') ||
          date.isSame(e.endDate, 'day')
        )

      return date.isSame(e.startDate, 'day')
    })
  }
  function handleCalendarDayClick(date: Moment) {
    if (onCalendarChange) onCalendarChange({ date, view: CALENDAR_VIEW.DAY })
  }
  function handleCalendarEventClick(event: ICalendarEvent) {
    if (onCalendarEventClick) onCalendarEventClick(event)
  }
  function handleShowMoreDialog(day: Moment, events: ICalendarEvent[]) {
    setDayDialog({
      day,
      events,
    })
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      position='relative'
      sx={{ minHeight: 500, ...sx }}
      {...boxProps}
    >
      <Grid container columns={7}>
        {Array.from(Array(7)).map((_, index) => (
          <Grid
            key={index}
            xs={1}
            sx={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: (theme) => theme.palette.divider,
              borderLeft: index === 0 ? undefined : 'hidden',
              borderBottom: 'hidden',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Typography variant='button'>{DAYS[index]}</Typography>
          </Grid>
        ))}
      </Grid>
      <Grid container columns={7} sx={{ flexGrow: 1 }}>
        {Array.from(Array(lastDate.diff(firstDate, 'days'))).map((_, index) => (
          <Grid
            key={index}
            xs={1}
            sx={{
              height: `${100 / numOfWeeks}%`,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: (theme) => theme.palette.divider,
              borderTop: 'hidden',
              borderLeft: index % 7 === 0 ? undefined : 'hidden',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <MonthDay
              date={moment(firstDate).add(index, 'days')}
              activeMonth={date.month()}
              events={getCalendarDayEvents(moment(firstDate).add(index, 'days').startOf('day'))}
              dense={isTiny}
              onDayClick={handleCalendarDayClick}
              onEventClick={handleCalendarEventClick}
              onEventCreate={onCalendarCreateEvent}
              onShowMoreClick={handleShowMoreDialog}
            />
          </Grid>
        ))}
      </Grid>
      {dayDialog && (
        <CalendarDayDialog
          open={true}
          day={dayDialog.day}
          events={dayDialog.events}
          onClose={() => setDayDialog(undefined)}
        />
      )}
      {isLoading && (
        <Box position='absolute' left={8} bottom={8} display='flex'>
          <CircularProgress />
        </Box>
      )}
    </Box>
  )
}

interface MonthDayProps {
  date: Moment
  activeMonth: number
  events: ICalendarEvent[]
  onDayClick?: (date: Moment) => void
  onEventClick?: (event: ICalendarEvent) => void
  onEventCreate?: (date: Moment) => void
  onShowMoreClick?: (date: Moment, events: ICalendarEvent[]) => void
  dense?: boolean
}

function MonthDay({
  date,
  activeMonth,
  onDayClick,
  onEventClick,
  onEventCreate,
  onShowMoreClick,
  events = [],
  dense,
}: MonthDayProps) {
  const isToday = moment().isSame(date, 'day')
  const elCallback = React.useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      const box = node.getBoundingClientRect()
      const scrollHeight = node.scrollHeight
      const itemHeight = CHIP_HEIGHT + 4
      const toTake =
        scrollHeight > box.height ? Math.ceil((scrollHeight - box.height) / itemHeight) + 1 : 0

      setItemsToHide(toTake)
    }
  }, [])
  const [itemsToHide, setItemsToHide] = React.useState(0)
  function handleIconClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()

    if (onDayClick) onDayClick(date)
  }
  function handleShowMoreClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation()

    if (onShowMoreClick) onShowMoreClick(date, events)
  }

  return (
    <Stack
      sx={{ width: '100%' }}
      onClick={() => {
        if (onEventCreate) onEventCreate(date)
      }}
    >
      <IconButton
        onClick={handleIconClick}
        size={dense ? 'small' : 'medium'}
        sx={{
          '&:hover': {
            backgroundColor: isToday ? 'primary.light' : undefined,
          },
          backgroundColor: isToday ? 'primary.main' : undefined,
          display: 'flex',
          mb: 0.5,
          alignSelf: 'center',
          alignItems: 'center',
          fontSize: '0.95rem',
          color: (theme) =>
            date.month() === activeMonth
              ? isToday
                ? '#FFF'
                : theme.palette.text.primary
              : theme.palette.text.secondary,
        }}
      >
        {date.format('D')}
      </IconButton>
      {!!events.length && (
        <Stack spacing={0.5} sx={{ px: 1, overflow: 'hidden' }} ref={elCallback}>
          {events.map((e, index) => {
            if (itemsToHide && index < events.length - itemsToHide) {
              return <MonthDayEvents key={e.id} event={e} dense={dense} onClick={onEventClick} />
            } else if (!itemsToHide) {
              return <MonthDayEvents key={e.id} event={e} dense={dense} onClick={onEventClick} />
            }

            return null
          })}
          {itemsToHide > 0 && (
            <Chip
              sx={{ height: CHIP_HEIGHT, maxHeight: CHIP_HEIGHT, minHeight: CHIP_HEIGHT }}
              label={dense ? `+${itemsToHide}` : `+${itemsToHide} more`}
              onClick={onShowMoreClick ? handleShowMoreClick : undefined}
            />
          )}
        </Stack>
      )}
    </Stack>
  )
}

interface MonthDayEventsProps {
  event: ICalendarEvent
  onClick?: (event: ICalendarEvent) => void
  dense?: boolean
}

function MonthDayEvents({ dense, event, onClick }: MonthDayEventsProps) {
  function hanldeClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    if (onClick) onClick(event)
  }
  return (
    <Chip
      size='small'
      onClick={onClick ? hanldeClick : undefined}
      label={
        <Typography variant='caption' color={event.isPastEvent ? 'text.secondary' : 'text.primary'}>
          {`${event.summary}${event.isAllDayEvent ? '' : event.startDate.format(' @ h:mma')}`}
        </Typography>
      }
      sx={{
        borderRadius: 2,
        height: CHIP_HEIGHT,
        maxHeight: CHIP_HEIGHT,
        minHeight: CHIP_HEIGHT,
        justifyContent: 'flex-start',
      }}
    />
  )
}
