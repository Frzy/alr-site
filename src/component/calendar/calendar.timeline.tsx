import * as React from 'react'
import { getFrontEndCalendarEvent } from '@/utils/helpers'
import { ICalendarEvent, IServerCalendarEvent } from '@/types/common'
import HelmetIcon from '@mui/icons-material/SportsMotorsports'
import moment, { Moment } from 'moment'
import pSBC from '@/utils/pSBC'
import useSWR, { Fetcher } from 'swr'
import { Box, BoxProps, Chip, IconButton, Stack, Typography } from '@mui/material'

import type { CalendarState } from './calendar'

const fetcher: Fetcher<ICalendarEvent[], string[]> = async (args) => {
  const now = moment()
  const [url, queryParams] = args
  const fullUrl = queryParams ? `${url}?${queryParams}` : url
  const response = await fetch(fullUrl)
  const data = (await response.json()) as IServerCalendarEvent[]

  return data.map(getFrontEndCalendarEvent)
}

const MINUTES_IN_DAY = 1440
const RIGHT_PADDING = 4
const LEFT_PADDING = 2

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

    const data = {
      start: startDate.format(),
      end: endDate.format(),
    }
    const searchParams = new URLSearchParams(data)

    return searchParams.toString()
  }, [days])
  const { data: events, isLoading } = useSWR(['/api/calendarEvents', queryParams], fetcher, {
    fallbackData: [],
  })
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
      return <AllDayTimelineEvent key={event.id} event={event} filler />
    }

    return <AllDayTimelineEvent key={event.id} event={event} />
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
                    borderLeft: dayIndex === 0 ? '1px solid rgb(218,220,224)' : undefined,
                    borderRight:
                      dayIndex !== days.length - 1 ? '1px solid rgb(218,220,224)' : undefined,
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
            <Box width={55} borderRight='1px solid rgb(218,220,224)' />
            <Box display='flex' flexGrow={1} width='calc(100% - 55px)'>
              {days.map((day, dayIndex) => (
                <Box
                  key={dayIndex}
                  display='flex'
                  flexBasis={`${100 / days.length}%`}
                  maxWidth={`${100 / days.length}%`}
                  flexDirection='column'
                  alignItems='center'
                  borderBottom='1px solid rgb(218,220,224)'
                >
                  <Typography component={'span'}>{day.format('ddd')}</Typography>
                  <IconButton
                    sx={{
                      '&:hover': {
                        backgroundColor: day.isSame(today, 'day') ? 'primary.light' : undefined,
                      },
                      backgroundColor: day.isSame(today, 'day') ? 'primary.main' : undefined,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {day.format('D')}
                  </IconButton>
                  <Box
                    alignSelf='flex-start'
                    flexGrow={1}
                    width='100%'
                    sx={{
                      borderRight:
                        dayIndex !== days.length - 1 ? '1px solid rgb(218,220,224)' : undefined,
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
              <Box key={index} height={48} width={48} position='relative'>
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
                  {index % 12 === 0 ? 12 : index % 12} {index < 12 ? 'am' : 'pm'}
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
                    height={48}
                    sx={{
                      '&::after': {
                        content: '""',
                        borderBottom: '1px solid rgb(218,220,224)',
                        position: 'absolute',
                        width: '100%',
                        marginTop: '-1px',
                        pointerEvents: 'none',
                      },
                    }}
                  />
                ))}
              </Box>
              <Box borderRight='1px solid rgb(218,220,224)' width={7} />
              {days.map((day, index) => (
                <Box
                  key={index}
                  flexGrow={1}
                  position='relative'
                  borderRight={'1px solid rgb(218,220,224)'}
                >
                  {!!events.length && getCalendarEvents(day)}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

type TimelineEventProps = {
  event: ICalendarEvent
  filler?: boolean
} & BoxProps

function TimelineEvent({
  event,
  height,
  left,
  top,
  width,
  zIndex,
  ...boxProps
}: TimelineEventProps) {
  const color = event.color
  const backgroundColor = event.isPastEvent ? pSBC(0.4, color) : color
  const hoverColor = pSBC(0.2, backgroundColor)

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
        pt: 0.5,
        ...boxProps.sx,
      }}
    >
      <Typography variant='caption' component='div' noWrap>
        {event.summary}
      </Typography>
    </Box>
  )
}

function AllDayTimelineEvent({ event, filler }: TimelineEventProps) {
  const color = event.color
  const backgroundColor = event.isPastEvent ? pSBC(0.4, color) : color
  const hoverColor = pSBC(0.2, backgroundColor)

  return (
    <Chip
      sx={{
        backgroundColor,
        justifyContent: 'flex-start',
        borderRadius: 1,
        color: (theme) => theme.palette.getContrastText(backgroundColor),
        '&:hover': {
          backgroundColor: hoverColor,
          color: (theme) => theme.palette.getContrastText(hoverColor),
        },
      }}
      size='small'
      label={filler ? '' : event.summary}
      onClick={() => console.log(event)}
    />
  )
}
