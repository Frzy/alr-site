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
  AlertColor,
  useMediaQuery,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { CALENDAR_VIEW, CalendarState } from './calendar'
import { getContrastTextColor, getFrontEndCalendarEvent } from '@/utils/helpers'
import {
  DEFAULT_CALENDAR_COLOR,
  DEFAULT_CALENDAR_COLOR_ID,
  ENDPOINT,
  EVENT_TYPE,
  RECURRENCE_MODE,
} from '@/utils/constants'
import CalendarDayDialog from './calendar.month.day.dialog'
import {
  ICalendarEvent,
  IRequestBodyCalendarEvent,
  IServerCalendarEvent,
  RecurrenceOptions,
} from '@/types/common'
import pSBC from '@/utils/pSBC'
import { useRouter } from 'next/router'
import CalendarEventDialog from './calendar.event.dialog'
import { createCalendarEvent, deleteCalendarEvent, fetcher, udpateCalendarEvent } from '@/utils/api'
import Notifier from '../notifier'
import CalendarCreateEventDialog from './calendar.create.event.dialog'

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const CHIP_HEIGHT = 20

type NotifierState = {
  open: boolean
  message: string
  severity: AlertColor
}
type DayDialogState = {
  day: Moment
  events: ICalendarEvent[]
}

type MonthCalendarProps = {
  date: Moment
  parseUrl?: boolean
  onCalendarChange?: (state: CalendarState) => void
} & BoxProps

export default function MonthCalendar({
  date,
  onCalendarChange,
  sx,
  ...boxProps
}: MonthCalendarProps) {
  const theme = useTheme()
  const isTiny = useMediaQuery(theme.breakpoints.down('sm'))
  const [calendarEvent, setCalendarEvent] = React.useState<ICalendarEvent>()
  const [newCalendarEvent, setNewCalendarEvent] = React.useState<ICalendarEvent>()
  const firstDate = React.useMemo(() => {
    return moment(date).startOf('month').day(0)
  }, [date])
  const lastDate = React.useMemo(() => {
    return moment(date).endOf('month').day(7)
  }, [date])
  const queryParams = React.useMemo(() => {
    return {
      start: firstDate.format(),
      end: lastDate.format(),
    }
  }, [firstDate, lastDate])
  const numOfWeeks = React.useMemo(() => lastDate.diff(firstDate, 'weeks'), [firstDate, lastDate])
  const {
    data: fetchedEvents,
    isLoading,
    isValidating,
    mutate,
  } = useSWR([ENDPOINT.EVENTS, queryParams], fetcher, {
    fallbackData: [],
  })
  const [dayDialog, setDayDialog] = React.useState<DayDialogState>()
  const [notifierState, setNotifierState] = React.useState<NotifierState>({
    open: false,
    message: '',
    severity: 'success',
  })
  const events = React.useMemo(() => {
    console.log({ fetchedEvents, newCalendarEvent })

    return newCalendarEvent ? [...fetchedEvents, newCalendarEvent] : [...fetchedEvents]
  }, [fetchedEvents, newCalendarEvent])

  function getCalendarDayEvents(date: Moment) {
    return events.filter((e) => {
      const isMultiDay = e.dayTotal > 1

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
  function handleCreateNewCalendarEvent(date: Moment) {
    setNewCalendarEvent({
      start: {
        date: date.format('YYYY-MM-DD'),
      },
      end: {
        date: moment(date).add(1, 'day').format('YYYY-MM-DD'),
      },
      color: DEFAULT_CALENDAR_COLOR,
      colorId: DEFAULT_CALENDAR_COLOR_ID,
      dayTotal: 1,
      endDate: moment(date),
      eventType: EVENT_TYPE.EVENT,
      isAllDayEvent: true,
      isPastEvent: moment().isAfter(date),
      startDate: moment(date),
      textColor: getContrastTextColor(DEFAULT_CALENDAR_COLOR),
    })
  }
  function handleCalendarEventClick(event: ICalendarEvent) {
    setCalendarEvent(event)
  }
  function handleShowMoreDialog(day: Moment, events: ICalendarEvent[]) {
    setDayDialog({
      day,
      events,
    })
  }
  function handleCalendarEventDialogClose() {
    setCalendarEvent(undefined)
    setNewCalendarEvent(undefined)
  }
  async function handleDeleteCalendarEvent(
    event: ICalendarEvent,
    recurrenceOptions?: RecurrenceOptions,
  ) {
    try {
      await deleteCalendarEvent(event, recurrenceOptions)

      if (recurrenceOptions?.mode === RECURRENCE_MODE.SINGLE) {
        mutate(events.filter((e) => e.id !== event.id))
      } else if (recurrenceOptions?.mode === RECURRENCE_MODE.ALL) {
        mutate(events.filter((e) => e.recurringEventId !== event.recurringEventId))
      } else if (recurrenceOptions?.mode === RECURRENCE_MODE.FUTURE && recurrenceOptions.stopDate) {
        const stopDate = recurrenceOptions.stopDate
        mutate(
          events.filter((e) => {
            return (
              e.recurringEventId !== event.recurringEventId ||
              (e.recurringEventId === event.recurringEventId && e.startDate.isBefore(stopDate))
            )
          }),
        )
      }
      setNotifierState({
        open: true,
        message: `Deleted event${recurrenceOptions?.mode !== RECURRENCE_MODE.SINGLE ? 's' : ''}`,
        severity: 'success',
      })
    } catch (error) {
      setNotifierState({
        open: true,
        message: `Oops failed to delete event${
          recurrenceOptions?.mode !== RECURRENCE_MODE.SINGLE ? 's' : ''
        }`,
        severity: 'error',
      })
    }
  }
  async function handleEditCalendarEvent(
    event: ICalendarEvent,
    body: IRequestBodyCalendarEvent,
    recurrenceOptions?: RecurrenceOptions,
  ) {
    try {
      await udpateCalendarEvent(event, body, recurrenceOptions)
      mutate()
      setNotifierState({
        open: true,
        message: `Updated event${recurrenceOptions?.mode !== RECURRENCE_MODE.SINGLE ? 's' : ''}`,
        severity: 'success',
      })
    } catch (error) {
      setNotifierState({
        open: true,
        message: `Oops failed to update event${
          recurrenceOptions?.mode !== RECURRENCE_MODE.SINGLE ? 's' : ''
        }`,
        severity: 'error',
      })
    }
  }
  async function handleCreateCalendarEvent(event: ICalendarEvent, body: IRequestBodyCalendarEvent) {
    try {
      await createCalendarEvent(body)
      setTimeout(() => {
        mutate([...fetchedEvents, event])
        setNewCalendarEvent(undefined)
      }, 500)
      setNotifierState({
        open: true,
        message: 'Created event',
        severity: 'success',
      })
    } catch (error) {
      setNewCalendarEvent(undefined)
      setNotifierState({
        open: true,
        message: 'Oops failed to create event',
        severity: 'error',
      })
    }
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
              borderColor: (theme) => theme.vars.palette.divider,
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
              borderColor: (theme) => theme.vars.palette.divider,
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
              onEventCreate={handleCreateNewCalendarEvent}
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
      {(isLoading || isValidating) && (
        <Box position='absolute' left={8} bottom={8} display='flex'>
          <CircularProgress />
        </Box>
      )}
      {newCalendarEvent && (
        <CalendarCreateEventDialog
          event={newCalendarEvent}
          open={true}
          onChange={(event) => setNewCalendarEvent(event)}
          onClose={handleCalendarEventDialogClose}
          onSave={handleCreateCalendarEvent}
        />
      )}
      {calendarEvent && (
        <CalendarEventDialog
          event={calendarEvent}
          open={true}
          editable
          onClose={handleCalendarEventDialogClose}
          onDelete={handleDeleteCalendarEvent}
          onEdit={handleEditCalendarEvent}
        />
      )}
      {}
      <Notifier
        {...notifierState}
        onClose={() => setNotifierState((prev) => ({ ...prev, open: false }))}
      />
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
          mt: '2px',
          '&:hover': {
            backgroundColor: isToday ? 'primary.light' : undefined,
          },
          backgroundColor: isToday ? 'primary.main' : undefined,
          display: 'flex',
          mb: 0.5,
          alignSelf: 'center',
          alignItems: 'center',
          fontSize: '0.95rem',
          width: { xs: 24, sm: 33 },
          height: { xs: 24, sm: 33 },
          color: (theme) =>
            date.month() === activeMonth
              ? isToday
                ? '#FFF'
                : theme.vars.palette.text.primary
              : theme.vars.palette.text.secondary,
        }}
      >
        {date.format('D')}
      </IconButton>
      {!!events.length && (
        <Stack spacing={0.5} sx={{ px: 1, overflow: 'hidden' }} ref={elCallback}>
          {events.map((e, index) => {
            if (itemsToHide && index < events.length - itemsToHide) {
              return <MonthDayEvents key={index} event={e} dense={dense} onClick={onEventClick} />
            } else if (!itemsToHide) {
              return <MonthDayEvents key={index} event={e} dense={dense} onClick={onEventClick} />
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
  const bgcolor = event.isPastEvent ? pSBC(0.7, event.color) : event.color
  const textColor = event.isPastEvent ? getContrastTextColor(bgcolor.slice(1)) : event.textColor
  const hoverColor = pSBC(-0.2, bgcolor)

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
          {`${event.summary ? event.summary : '(No Title)'}${
            event.isAllDayEvent ? '' : event.startDate.format(' @ h:mma')
          }`}
        </Typography>
      }
      sx={{
        '&:hover': {
          bgcolor: hoverColor,
          '& .MuiTypography-root': {
            color: () =>
              event.isPastEvent ? `#0000007F` : getContrastTextColor(hoverColor.slice(1)),
          },
        },
        borderRadius: 2,
        height: CHIP_HEIGHT,
        maxHeight: CHIP_HEIGHT,
        minHeight: CHIP_HEIGHT,
        bgcolor,
        justifyContent: 'flex-start',
        '& .MuiTypography-root': {
          color: () => (event.isPastEvent ? `#0000007F` : event.textColor),
        },
      }}
    />
  )
}
