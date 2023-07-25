import * as React from 'react'
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  StackProps,
  Typography,
  TypographyProps,
} from '@mui/material'
import { CALENDAR_VIEW, CalendarState } from './calendar'
import { ENDPOINT, RECURRENCE_MODE } from '@/utils/constants'
import { deleteCalendarEvent, fetcher, udpateCalendarEvent } from '@/utils/api'
import {
  ICalendarEvent,
  IRequestBodyCalendarEvent,
  NotifierState,
  RecurrenceOptions,
} from '@/types/common'
import CalendarEventDialog from './calendar.event.dialog'
import HelmetIcon from '@mui/icons-material/SportsMotorsports'
import moment, { Moment } from 'moment'
import useSWR, { SWRConfiguration } from 'swr'
import Notifier from '../notifier'

type CalendarScheduleProps = {
  date: Moment
  endDate?: Moment
  title?: string
  titleProps?: TypographyProps
  onCalendarChange?: (state: CalendarState) => void
  fetchOptions?: SWRConfiguration
} & StackProps

export default function CalendarSchedule({
  date,
  endDate,
  fetchOptions = {},
  title,
  titleProps,
  onCalendarChange,
  ...stackProps
}: CalendarScheduleProps) {
  const now = moment()
  const [openEventViewer, setOpenEventViewer] = React.useState(false)
  const [selected, setSelected] = React.useState<ICalendarEvent>()
  const queryParams = React.useMemo(() => {
    const eDate = endDate ? endDate : moment(date).add(1, 'month').endOf('day')

    return {
      start: date.startOf('day').format(),
      end: eDate.format(),
    }
  }, [date, endDate])
  const {
    data: fetchedEvents,
    isLoading,
    isValidating,
    mutate,
  } = useSWR([ENDPOINT.EVENTS, queryParams], fetcher, {
    fallbackData: [],
    ...fetchOptions,
  })
  const { events, minDate } = React.useMemo(() => {
    let minDate = moment()
    let maxDate = moment()

    fetchedEvents.forEach((e) => {
      minDate = minDate.isAfter(e.startDate) ? moment(e.startDate).startOf('day') : minDate
      maxDate = maxDate.isBefore(e.endDate) ? moment(e.endDate).endOf('day') : maxDate
    })

    const dayDuration = maxDate.diff(minDate, 'days')

    if (fetchedEvents.length) {
      const groupedEvents: ICalendarEvent[][] = Array.from(Array(dayDuration + 1), (x) => [])
      fetchedEvents.forEach((e) => {
        const duration = e.endDate.diff(e.startDate, 'day')
        const fromMin = e.startDate.diff(minDate, 'days')

        for (let i = 0; i <= duration; i++) {
          groupedEvents[fromMin + i].push({
            dayNumber: i + 1,
            ...e,
          })
        }
      })

      return { minDate, events: groupedEvents.filter((g) => !!g.length) }
    }

    return { events: [], minDate }
  }, [fetchedEvents])
  const [notifierState, setNotifierState] = React.useState<NotifierState>({
    open: false,
    message: '',
    severity: 'success',
  })

  function shouldRenderIndicator(group: ICalendarEvent[], index: number) {
    const event = group[index]
    const prevEvent = index - 1 > 0 ? group[index - 1] : null
    const nextEvent = group[index + 1]

    if (now.isBetween(event.startDate, event.endDate)) return 'before'
    if (prevEvent && now.isBefore(event.startDate) && now.isAfter(prevEvent.endDate))
      return 'before'
    if (!nextEvent && now.isAfter(prevEvent?.startDate)) return 'after'

    return false
  }
  function handleCalendarEventClick(event?: ICalendarEvent) {
    setSelected(event)
    setOpenEventViewer(true)
  }
  async function handleDeleteCalendarEvent(
    event: ICalendarEvent,
    recurrenceOptions?: RecurrenceOptions,
  ) {
    try {
      await deleteCalendarEvent(event, recurrenceOptions)

      if (recurrenceOptions?.mode === RECURRENCE_MODE.SINGLE) {
        mutate(fetchedEvents.filter((e) => e.id !== event.id))
      } else if (recurrenceOptions?.mode === RECURRENCE_MODE.ALL) {
        mutate(fetchedEvents.filter((e) => e.recurringEventId !== event.recurringEventId))
      } else if (recurrenceOptions?.mode === RECURRENCE_MODE.FUTURE && recurrenceOptions.stopDate) {
        const stopDate = recurrenceOptions.stopDate
        mutate(
          fetchedEvents.filter((e) => {
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

  return (
    <Box position='relative' display='flex' flexGrow={1} height='calc(100% - 64px)' overflow='auto'>
      {isLoading ? (
        <Stack spacing={1} flexGrow={1} {...stackProps}>
          {!!title && (
            <Typography variant='h4' {...titleProps}>
              {title}
            </Typography>
          )}
          {Array(5)
            .fill(1)
            .map((_, index) => (
              <SkeletonEvent key={index} />
            ))}
        </Stack>
      ) : (
        <React.Fragment>
          <Stack spacing={1} flexGrow={1} {...stackProps}>
            {!!title && (
              <Typography variant='h4' {...titleProps}>
                {title}
              </Typography>
            )}
            {events.map((group, dayIndex) => {
              const day = moment(date).startOf('day')
              const displayDate = moment(minDate).add(dayIndex, 'days')
              const isSameDay = displayDate.isSame(now, 'day')

              if (group.length && displayDate.isAfter(day)) {
                return (
                  <Box key={dayIndex} sx={{ px: { xs: 0.5, md: 1 } }}>
                    <Box position='relative' display='flex'>
                      <Box
                        sx={{
                          mt: {
                            xs: '8px',
                            md: 0,
                          },
                        }}
                      >
                        <IconButton
                          onClick={() => {
                            if (onCalendarChange)
                              onCalendarChange({ view: CALENDAR_VIEW.DAY, date: displayDate })
                          }}
                          disabled={!onCalendarChange}
                          sx={{
                            width: { xs: 24, md: 48 },
                            height: { xs: 24, md: 48 },
                            fontSize: '1rem',
                            backgroundColor: isSameDay ? 'primary.main' : undefined,
                            '&:hover': {
                              backgroundColor: isSameDay ? 'primary.light' : undefined,
                            },
                          }}
                        >
                          {displayDate.format('D')}
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          pt: { xs: '11px', md: '16px' },
                          pl: { xs: '4px', md: '8px' },
                          minWidth: { xs: 70, md: 85 },
                        }}
                      >
                        <Typography
                          noWrap
                          variant='body2'
                          color={isSameDay ? 'primary.main' : undefined}
                        >
                          {displayDate.format('MMM, ddd')}
                        </Typography>
                      </Box>
                      <Box
                        flexGrow={1}
                        pb={1}
                        sx={{
                          borderBottom: '1px solid rgb(218,220,224)',
                          position: 'relative',
                        }}
                      >
                        {group.map((e, index) => {
                          const renderIndicator =
                            now.isSame(e.startDate, 'day') &&
                            !e.isAllDayEvent &&
                            shouldRenderIndicator(group, index)

                          if (renderIndicator) {
                            return renderIndicator === 'before'
                              ? [
                                  <ScheduleNowIndicator key={index} />,
                                  <ScheduleEvent
                                    key={e.id}
                                    event={e}
                                    selected={e.id === selected?.id}
                                    onEventClick={handleCalendarEventClick}
                                  />,
                                ]
                              : [
                                  <ScheduleEvent
                                    key={e.id}
                                    event={e}
                                    selected={e.id === selected?.id}
                                    onEventClick={handleCalendarEventClick}
                                  />,
                                  <ScheduleNowIndicator key={index} />,
                                ]
                          }

                          return (
                            <ScheduleEvent
                              onEventClick={handleCalendarEventClick}
                              key={e.id}
                              event={e}
                              selected={e.id === selected?.id}
                            />
                          )
                        })}
                      </Box>
                    </Box>
                  </Box>
                )
              }

              return null
            })}
          </Stack>
          {selected && (
            <CalendarEventDialog
              event={selected}
              open={openEventViewer}
              onClose={() => {
                setSelected(undefined)
                setOpenEventViewer(false)
              }}
              onDelete={handleDeleteCalendarEvent}
              onEdit={handleEditCalendarEvent}
              editable
            />
          )}
          {isValidating && (
            <Box position='absolute' left={16} bottom={16} display='flex'>
              <CircularProgress />
            </Box>
          )}
          <Notifier
            {...notifierState}
            onClose={() => setNotifierState((prev) => ({ ...prev, open: false }))}
          />
        </React.Fragment>
      )}
    </Box>
  )
}

type ScheduleEventProps = {
  event: ICalendarEvent
  selected?: boolean
  onEventClick?: (calendarEvent?: ICalendarEvent) => void
}

function ScheduleEvent({ event, selected, onEventClick }: ScheduleEventProps) {
  return (
    <Box
      className={event.isPastEvent ? 'past' : undefined}
      display='flex'
      alignItems='center'
      onClick={() => {
        if (onEventClick) onEventClick(selected ? undefined : event)
      }}
      sx={{
        boxShadow: selected ? (theme) => theme.shadows[5] : undefined,
        p: 1,
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        bgcolor: selected ? 'divider' : undefined,
        '&:hover': selected
          ? undefined
          : {
              backgroundColor: 'divider',
            },
      }}
    >
      <Box
        component='span'
        width={16}
        height={16}
        sx={{ backgroundColor: event.color, borderRadius: 10 }}
      />
      <Typography
        component='span'
        variant='body2'
        pl={1}
        minWidth={150}
        color={event.isPastEvent ? 'text.disabled' : undefined}
      >
        {event.isAllDayEvent
          ? 'All Day'
          : `${event.startDate.format('h:mm')} - ${event.endDate.format('h:mma')}`}
      </Typography>
      <Typography
        component='span'
        variant='body2'
        color={event.isPastEvent ? 'text.disabled' : undefined}
        fontWeight={500}
        noWrap
      >
        {event.summary}
        {event.dayTotal > 1 ? ` (Day ${event.dayNumber}/${event.dayTotal})` : ''}
        {event.location && !event.isPastEvent && (
          <Typography component='span' variant='body2' sx={{ pl: 1 }} color='text.secondary'>
            {event.location}
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

function SkeletonEvent() {
  return (
    <Box display='flex' sx={{ p: 1 }} gap={1}>
      <Skeleton variant='circular' width={40} height={40} animation='wave' />
      <Skeleton variant='rectangular' height={40} sx={{ flexGrow: 1 }} />
    </Box>
  )
}

function ScheduleNowIndicator() {
  return (
    <Box height={2} bgcolor='red' position='relative'>
      <Box position='absolute' top={-12} left={-20}>
        <HelmetIcon sx={{ color: 'red' }} />
      </Box>
    </Box>
  )
}
