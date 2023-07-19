import * as React from 'react'
import { getContrastTextColor, getFrontEndCalendarEvent } from '@/utils/helpers'
import {
  ICalendarEvent,
  IRequestBodyCalendarEvent,
  IServerCalendarEvent,
  NotifierState,
  RecurrenceOptions,
} from '@/types/common'
import HelmetIcon from '@mui/icons-material/SportsMotorsports'
import moment, { Moment } from 'moment'
import pSBC from '@/utils/pSBC'
import useSWR, { Fetcher } from 'swr'
import { Box, BoxProps, Chip, IconButton, Stack, Typography, CircularProgress } from '@mui/material'

import { CALENDAR_VIEW, CalendarState } from './calendar'
import { createCalendarEvent, deleteCalendarEvent, fetcher, udpateCalendarEvent } from '@/utils/api'
import {
  DEFAULT_CALENDAR_COLOR,
  DEFAULT_CALENDAR_COLOR_ID,
  ENDPOINT,
  EVENT_TYPE,
  RECURRENCE_MODE,
} from '@/utils/constants'
import CalendarEventDialog from './calendar.event.dialog'
import Notifier from '../notifier'
import CalendarCreateEventDialog from './calendar.create.event.dialog'

const MINUTES_IN_DAY = 1440
const RIGHT_PADDING = 24
const LEFT_PADDING = 2
const HOUR_HEIGHT = 48

type CalendarTimelineProps = {
  date: Moment
  mode?: 'day' | 'week'
  onCalendarChange?: (state: CalendarState) => void
} & BoxProps

export default function CalendarTimeline({
  date,
  mode = 'week',
  onCalendarChange,
  ...boxProps
}: CalendarTimelineProps) {
  const today = moment()
  const days = React.useMemo(() => {
    const startDate = moment(date).day(0)
    const dates: Moment[] = []

    if (mode === 'day') {
      dates.push(date.startOf('day'))
    } else {
      Array.from(Array(7)).forEach((_, index) => {
        dates.push(moment(startDate).startOf('day').add(index, 'days'))
      })
    }

    return dates
  }, [date, mode])
  const queryParams = React.useMemo(() => {
    const startDate = moment(days[0])
    const endDate = moment(days[days.length - 1]).endOf('day')

    return {
      start: startDate.format(),
      end: endDate.format(),
    }
  }, [days])
  const [notifierState, setNotifierState] = React.useState<NotifierState>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [calendarEvent, setCalendarEvent] = React.useState<ICalendarEvent>()
  const [newCalendarEvent, setNewCalendarEvent] = React.useState<ICalendarEvent>()
  const {
    data: fetchedEvents,
    isLoading,
    isValidating,
    mutate,
  } = useSWR([ENDPOINT.EVENTS, queryParams], fetcher, {
    fallbackData: [],
  })
  const events = React.useMemo(() => {
    return newCalendarEvent ? [...fetchedEvents, newCalendarEvent] : [...fetchedEvents]
  }, [fetchedEvents, newCalendarEvent])
  const allDayEvents = React.useMemo(() => {
    const positions: ICalendarEvent[][] = Array.from(Array(days.length), (x) => [])
    const dayEvents = events.filter((e) => e.isAllDayEvent)
    days.map((day, dayIndex) => {
      dayEvents.forEach((e) => {
        if (e.startDate.isSame(day, 'day') || (dayIndex === 0 && e.startDate.isBefore(day))) {
          const eventDurationFromDay = e.endDate.diff(day, 'day')
          let positionIndex = positions[dayIndex].findIndex((p) => p === undefined)

          if (positionIndex === -1) positionIndex = positions[dayIndex].length

          for (
            let i = Math.min(dayIndex, days.length - 1);
            i <= Math.min(eventDurationFromDay + dayIndex, days.length - 1);
            i++
          ) {
            if (positions[i].length < positionIndex) {
              for (let j = 0; j <= positionIndex; j++) {
                positions[i][j] = positions[i][j] || undefined
              }
            }

            positions[i][positionIndex] = e
          }
        }
      })
    })

    return positions
  }, [events, days])
  const eventClusters = React.useMemo(() => {
    const clusters: ICalendarEvent[][] = []
    const calEvents = events.filter((e) => !e.isAllDayEvent)

    for (let i = 0; i < calEvents.length; i++) {
      const currentEvnet = calEvents[i]
      const startDate = currentEvnet.startDate
      const endDate = currentEvnet.endDate
      const localCluster = [currentEvnet]

      if (startDate.isSame(endDate, 'day')) {
        while (i + 1 < calEvents.length && calEvents[i + 1].startDate.isBefore(endDate)) {
          localCluster.push(calEvents[i + 1])
          i++
        }

        clusters.push(localCluster)
      }
    }

    clusters.sort((a: ICalendarEvent[], b: ICalendarEvent[]) => {
      const aTime = a[0].startDate
      const bTime = b[0].startDate

      if (aTime.isSame(bTime)) return 0

      return aTime.isBefore(bTime) ? -1 : 1
    })

    return clusters
  }, [events])

  function getCalendarEvents(day: Moment) {
    const now = moment()

    const calendarEvents = eventClusters.map((cluster, clusterIndex) => {
      const previousCluster = clusterIndex - 1 >= 0 ? eventClusters[clusterIndex - 1] : null
      const preClusterEndTime = previousCluster
        ? previousCluster[previousCluster.length - 1].endDate
        : null

      const nextCluster =
        clusterIndex + 1 < eventClusters.length ? eventClusters[clusterIndex + 1] : null
      const nextClusterEndTime = nextCluster ? nextCluster[nextCluster.length - 1].startDate : null

      return cluster
        .filter((e) => {
          return e.startDate.isBetween(moment(day).startOf('day'), moment(day).endOf('day'))
        })
        .map((event, index) => {
          let width: string
          const startDate = event.startDate
          const endDate = event.endDate
          const fromMidnight = startDate.diff(moment(startDate).startOf('day'), 'minutes')
          const duration = endDate.diff(startDate, 'minutes')
          const topPercent = (fromMidnight / MINUTES_IN_DAY) * 100
          const heightPercent = (duration / MINUTES_IN_DAY) * 100
          const nextEvent = index + 1 < cluster.length ? cluster[index + 1] : null
          const nextStartTime = nextEvent ? nextEvent.startDate : null
          const fullWidth = nextStartTime ? nextStartTime.diff(startDate, 'minutes') >= 45 : false

          if (cluster.length > 1 && index === cluster.length - 1) {
            width = `calc((100% - 0px) * ${1 / cluster.length} - ${RIGHT_PADDING}px)`
          } else if (fullWidth && index === cluster.length - 1) {
            width = `calc((100% - 0px) - ${RIGHT_PADDING}px)`
          } else if (preClusterEndTime && startDate.isBefore(preClusterEndTime)) {
            width = `calc((100% - 0px) * ${17 / (2 * 10)} - ${RIGHT_PADDING}px)`
          } else if (cluster.length === 1) {
            width = `calc((100% - 0px) * ${1 / cluster.length} - ${RIGHT_PADDING}px)`
          } else {
            width = `calc((100% - 0px) * ${17 / (cluster.length * 10)} - ${RIGHT_PADDING}px)`
          }

          return (
            <TimelineEvent
              key={event.id}
              top={`${topPercent}%`}
              height={`${heightPercent}%`}
              left={`calc((100%) * ${index / cluster.length} + ${LEFT_PADDING}px)`}
              width={width}
              zIndex={index}
              event={event}
              mode={mode}
              onClick={handleEventClick}
              sx={{ zIndex: 2 }}
            />
          )
        })
    })

    if (day.isSame(now, 'day')) {
      const top = now.diff(moment(day).startOf('day'), 'minutes')

      calendarEvents.push([
        <Box
          key={'now'}
          position='absolute'
          top={`${(top / MINUTES_IN_DAY) * 100}%`}
          width='100%'
          height={2}
          bgcolor='red'
          zIndex={1}
        >
          <Box ml='-12px' mt='-12px'>
            <HelmetIcon sx={{ color: 'red' }} />
          </Box>
        </Box>,
      ])
    }

    return calendarEvents.flat().filter(Boolean)
  }
  function getAllDayEvent(event: ICalendarEvent | undefined, dayIndex: number) {
    if (!event) return <Box key={dayIndex} minHeight={24} />

    if (
      dayIndex - 1 >= 0 &&
      allDayEvents[dayIndex - 1].findIndex((e) => {
        return e ? e?.id === event.id : false
      }) !== -1
    ) {
      return <AllDayTimelineEvent key={event.id} event={event} mode={mode} filler />
    }

    return (
      <AllDayTimelineEvent key={event.id} event={event} mode={mode} onClick={handleEventClick} />
    )
  }

  function handleDayClick(date: Moment) {
    return (event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()

      if (onCalendarChange) onCalendarChange({ view: CALENDAR_VIEW.DAY, date })
    }
  }
  function handleEventClick(event: ICalendarEvent) {
    setCalendarEvent(event)
  }
  function handleAddNewAllDayCalendarEvent(date: Moment) {
    return (event: React.MouseEvent) => {
      setNewCalendarEvent({
        id: crypto.randomUUID(),
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
  }
  function handleAddNewCalendarEvent(date: Moment) {
    return (event: React.MouseEvent<HTMLElement>) => {
      const box = event.currentTarget.getBoundingClientRect()
      const point = {
        x: event.clientX - box.left,
        y: event.clientY - box.top,
      }

      const totalHour = point.y / HOUR_HEIGHT // mouse point convert to hour of day
      const fractionHour = totalHour % 1
      const hour = Math.round(totalHour - fractionHour)
      const minute = fractionHour < 0.5 ? 0 : 30

      const start = moment(date).startOf('day').hour(hour).minute(minute)
      const end = moment(start).add(1, 'hour')

      setNewCalendarEvent({
        id: crypto.randomUUID(),
        start: {
          dateTime: start.format(),
        },
        end: {
          dateTime: end.format(),
        },
        color: DEFAULT_CALENDAR_COLOR,
        colorId: DEFAULT_CALENDAR_COLOR_ID,
        dayTotal: end.diff(start, 'day') + 1,
        endDate: end,
        eventType: EVENT_TYPE.EVENT,
        isAllDayEvent: false,
        isPastEvent: moment().isAfter(end),
        startDate: start,
        textColor: getContrastTextColor(DEFAULT_CALENDAR_COLOR),
      })
    }
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
    <Box display='flex' flexDirection='column' overflow='hidden' {...boxProps}>
      <Box>
        {mode === 'day' ? (
          <Box display='flex'>
            <Box width={55} />
            <Box flexGrow={1} pr={3}>
              <Box pl={1}>
                <Typography variant='body2' color='text.secondary' fontWeight='fontWeightBold'>
                  {date.format('dddd')}
                </Typography>
                <Typography variant='h5' fontWeight='fontWeightBold'>
                  {date.format('MMM Do')}
                </Typography>
              </Box>
              {days.map((day, dayIndex) => (
                <Box
                  key={dayIndex}
                  alignSelf='flex-start'
                  flexGrow={1}
                  width='100%'
                  pl={1}
                  sx={{
                    borderLeft: (theme) =>
                      dayIndex === 0 ? `1px solid ${theme.palette.divider}` : undefined,
                    borderRight: (theme) =>
                      dayIndex !== days.length - 1
                        ? `1px solid ${theme.palette.divider}`
                        : undefined,
                    minHeight: 16,
                    py: allDayEvents.length && 0.5,
                  }}
                >
                  <Stack spacing={0.5}>
                    {allDayEvents[dayIndex].map((event, eventIndex) => {
                      return getAllDayEvent(event, dayIndex)
                    })}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box display='flex'>
            <Box width={55} sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }} />
            <Box display='flex' flexGrow={1} width='calc(100% - 55px)'>
              {days.map((day, dayIndex) => (
                <Box
                  key={dayIndex}
                  display='flex'
                  flexBasis={`${100 / days.length}%`}
                  maxWidth={`${100 / days.length}%`}
                  flexDirection='column'
                  alignItems='center'
                  sx={{
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                  onClick={handleAddNewAllDayCalendarEvent(day)}
                >
                  <Typography component={'span'}>{day.format('ddd')}</Typography>
                  <IconButton
                    sx={{
                      width: 40,
                      height: 40,
                      '&.Mui-disabled': {
                        bgcolor: 'primary.main',
                        color: 'text.primary',
                      },
                    }}
                    onClick={handleDayClick(day)}
                    disabled={day.isSame(today, 'day')}
                  >
                    {day.format('D')}
                  </IconButton>
                  <Box
                    alignSelf='flex-start'
                    flexGrow={1}
                    width='100%'
                    sx={{
                      borderRight: (theme) =>
                        dayIndex !== days.length - 1
                          ? `1px solid ${theme.palette.divider}`
                          : undefined,
                      minHeight: 16,
                      py: allDayEvents.length && 0.5,
                    }}
                  >
                    <Stack spacing={0.5}>
                      {allDayEvents[dayIndex].map((event, eventIndex) => {
                        return getAllDayEvent(event, dayIndex)
                      })}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box aria-hidden sx={{ overflow: 'scroll', visibility: 'hidden', flex: 'none' }} />
          </Box>
        )}
      </Box>
      <Box role='presentation' tabIndex={-1} overflow='auto'>
        <Box position='relative' display='flex'>
          <Box>
            {Array.from(Array(24)).map((_, index) => (
              <Box key={index} height={HOUR_HEIGHT} width={48} position='relative'>
                <Typography
                  component='span'
                  variant='caption'
                  sx={{
                    top: -10,
                    textAlign: 'right',
                    position: 'relative',
                    display: 'block',
                    color: index % 12 === 0 && index < 12 ? '#FFF' : undefined,
                    mr: 0,
                    pr: 0.5,
                  }}
                >
                  {index === 0 ? '' : index % 12 === 0 ? 12 : index % 12}{' '}
                  {index === 0 ? '' : index < 12 ? 'am' : 'pm'}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box flexGrow={1} position='relative'>
            <Box minWidth='100%' display='flex'>
              <Box aria-hidden='true' width={0}>
                {Array.from(Array(24)).map((_, index) => (
                  <Box
                    key={index}
                    height={HOUR_HEIGHT}
                    sx={{
                      '&::after': {
                        content: '""',
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        position: 'absolute',
                        width: '100%',
                        marginTop: '-1px',
                        pointerEvents: 'none',
                      },
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }}
                width={7}
              />
              {days.map((day, index) => (
                <Box
                  key={index}
                  flexGrow={1}
                  position='relative'
                  sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}` }}
                  onClick={handleAddNewCalendarEvent(day)}
                >
                  {!!events.length && getCalendarEvents(day)}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      {(isLoading || isValidating) && (
        <Box position='absolute' left={64} bottom={8} display='flex'>
          <CircularProgress />
        </Box>
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
      {newCalendarEvent && (
        <CalendarCreateEventDialog
          event={newCalendarEvent}
          open={true}
          onChange={(event) => setNewCalendarEvent(event)}
          onClose={handleCalendarEventDialogClose}
          onSave={handleCreateCalendarEvent}
        />
      )}
      <Notifier
        {...notifierState}
        onClose={() => setNotifierState((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  )
}

type TimelineEventProps = {
  event: ICalendarEvent
  mode: 'day' | 'week'
  filler?: boolean
  onClick?: (event: ICalendarEvent) => void
} & Omit<BoxProps, 'onClick'>

function TimelineEvent({
  event,
  height,
  left,
  top,
  width,
  zIndex,
  mode,
  onClick,
  ...boxProps
}: TimelineEventProps) {
  const color = event.color
  const duration = event.endDate.diff(event.startDate, 'minutes')
  const backgroundColor = event.isPastEvent ? pSBC(0.4, color) : color
  const hoverColor = pSBC(0.2, backgroundColor)
  const title = event.summary ? event.summary : '(No Title)'

  function handleClick(clickEvent: React.MouseEvent) {
    clickEvent.stopPropagation()
    clickEvent.preventDefault()

    if (onClick) onClick(event)
  }

  return (
    <Box
      {...boxProps}
      position='absolute'
      top={top}
      height={height}
      left={left}
      width={width}
      zIndex={zIndex}
      sx={{
        backgroundColor,
        color: (theme) => theme.palette.getContrastText(backgroundColor),
        '&:hover': {
          backgroundColor: hoverColor,
          color: (theme) => theme.palette.getContrastText(hoverColor),
        },
        borderRadius: 2,
        pl: 0.5,
        pt: duration <= 15 ? 0 : 0.5,
        cursor: 'pointer',
        ...boxProps.sx,
      }}
      onClick={handleClick}
    >
      {duration <= 15 ? (
        <Typography variant='caption' component='div' fontSize={12} lineHeight={1} noWrap>
          {title} @ {event.startDate.format('h:mma')}
          {mode === 'day' && event.location ? ` - ${event.location}` : ''}
        </Typography>
      ) : duration <= 30 ? (
        <Typography variant='caption' component='div' noWrap>
          {title} @ {event.startDate.format('h:mma')}
          {mode === 'day' && event.location ? ` - ${event.location}` : ''}
        </Typography>
      ) : duration <= 60 ? (
        <React.Fragment>
          <Typography variant='caption' component='div' noWrap>
            {title}
          </Typography>
          <Typography variant='caption' component='div' noWrap>
            {`${event.startDate.format('h:mma')}${event.location ? ` - ${event.location}` : ''}`}
          </Typography>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography variant='caption' component='div' noWrap>
            {title}
          </Typography>
          <Typography variant='caption' component='div' noWrap>
            {event.startDate.format('h:mma')}
          </Typography>
          {event.location && (
            <Typography variant='caption' component='div' noWrap>
              {event.location}
            </Typography>
          )}
        </React.Fragment>
      )}
    </Box>
  )
}
function AllDayTimelineEvent({ event, onClick, filler }: TimelineEventProps) {
  const color = event.color
  const backgroundColor = event.isPastEvent ? pSBC(0.4, color) : color
  const hoverColor = pSBC(0.2, backgroundColor)
  const title = event.summary ? event.summary : '(No Title)'

  function handleClick(clickEvent: React.MouseEvent) {
    clickEvent.stopPropagation()
    clickEvent.preventDefault()

    if (onClick) onClick(event)
  }

  return (
    <Chip
      sx={{
        backgroundColor,
        justifyContent: 'flex-start',
        borderRadius: 1,
        width: `calc(100% - ${RIGHT_PADDING}px)`,
        ml: LEFT_PADDING ? `${LEFT_PADDING}px` : 0,
        color: (theme) => theme.palette.getContrastText(backgroundColor),
        '&:hover': {
          backgroundColor: hoverColor,
          color: (theme) => theme.palette.getContrastText(hoverColor),
        },
      }}
      size='small'
      label={filler ? '' : title}
      onClick={handleClick}
    />
  )
}
