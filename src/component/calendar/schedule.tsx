import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import moment, { Moment } from 'moment'
import HelmetIcon from '@mui/icons-material/SportsMotorsports'
import { Box, IconButton, Stack, StackProps, Typography } from '@mui/material'
import CalendarEventDialog from './calendar.event.dialog'
import { CALENDAR_VIEW, CalendarState } from './calendar'
import { getCalendarEventColor, getCalendarEventFromGoogleEvent } from '@/utils/helpers'

import type { calendar_v3 } from 'googleapis'
import type { ICalendarEvent } from './calendar.timeline'
import CalendarEditEventDialog from './calendar.event.edit.dialog'
import { ENDPOINT } from '@/utils/constants'

const fetcher: Fetcher<ICalendarEvent[][], string[]> = async (args) => {
  const now = moment()
  const [url, queryParams] = args
  const fullUrl = queryParams ? `${url}?${queryParams}` : url
  const response = await fetch(fullUrl)
  const data = (await response.json()) as calendar_v3.Schema$Events
  const events = getCalendarEventFromGoogleEvent(data.items)
  let minDate = moment()
  let maxDate = moment()

  events.forEach((e) => {
    minDate = minDate.isAfter(e.startDate) ? moment(e.startDate).startOf('day') : minDate
    maxDate = maxDate.isBefore(e.endDate) ? moment(e.endDate).endOf('day') : maxDate
  })

  const dayDuration = maxDate.diff(minDate, 'days')
  const groupedEvents: ICalendarEvent[][] = Array.from(Array(dayDuration + 1), (x) => [])

  events.forEach((e) => {
    const duration = e.endDate.diff(e.startDate, 'day')
    const fromMin = e.startDate.diff(minDate, 'days')

    for (let i = 0; i <= duration; i++) {
      groupedEvents[fromMin + i].push({
        dayNumber: i + 1,
        ...e,
      })
    }
  })

  return groupedEvents
}

type CalendarScheduleProps = {
  date: Moment
  onCalendarChange?: (state: CalendarState) => void
  onEventClick?: (event: calendar_v3.Schema$Event) => void
} & StackProps

export default function CalendarSchedule({
  date,
  onCalendarChange,
  ...stackProps
}: CalendarScheduleProps) {
  const now = moment()
  const endMonth = React.useMemo(() => moment(date).add(1, 'month').endOf('day'), [date])
  const [openEventViewer, setOpenEventViewer] = React.useState(false)
  const [openEditEvent, setOpenEditEvent] = React.useState(false)
  const [selected, setSelected] = React.useState<ICalendarEvent>()
  const queryParams = React.useMemo(() => {
    const data = {
      start: date.startOf('day').format(),
      end: endMonth.format(),
    }
    const searchParams = new URLSearchParams(data)

    return searchParams.toString()
  }, [date, endMonth])
  const { data: events, isLoading } = useSWR([ENDPOINT.EVENTS, queryParams], fetcher, {
    fallbackData: [],
  })
  const minDate = events.length ? events[0][0].startDate : moment()

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

  return (
    <Box
      position='relative'
      display='flex'
      flexGrow={1}
      height='calc(100% - 64px)'
      overflow='auto'
      pt={1}
    >
      <Stack spacing={1} flexGrow={1} {...stackProps}>
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
          editable
          onClose={() => {
            setSelected(undefined)
            setOpenEventViewer(false)
          }}
        />
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
  const color = getCalendarEventColor(event.eventType)

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
        '&:hover': selected
          ? undefined
          : {
              backgroundColor: 'rgb(218,220,224)',
            },
      }}
    >
      <Box
        component='span'
        width={16}
        height={16}
        sx={{ backgroundColor: color.main, borderRadius: 10 }}
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
      </Typography>
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
