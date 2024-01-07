import type { ICalendarEvent } from '@/types/common'
import { getDaysEvents } from '@/utils/calendar'
import { Box, IconButton, Tooltip } from '@mui/material'
import { type Dayjs } from 'dayjs'
import React from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import WeekHeaderDay from './WeekHeaderDay'

const MIN_EVENTS = 2

interface WeekHeaderProps {
  startDate: Dayjs
  events?: ICalendarEvent[]
  onCreateAllDayEvent?: (date: Dayjs) => void
}
export default function WeekHeader({
  events = [],
  startDate,
  onCreateAllDayEvent,
}: WeekHeaderProps): JSX.Element {
  const [showAllDayEvents, setShowAllDayEvents] = React.useState(false)
  const [selectedEvent, setSelectedEvent] = React.useState<ICalendarEvent | null>(null)
  const buckets = Array.from(Array(7)).map((_, index) => {
    const day = startDate.add(index, 'day')
    return { day, events: getDaysEvents(events, day) }
  })
  const { maxDayEvents, extraAllDayEvents } = buckets.reduce(
    (numbers, bucket) => {
      return {
        maxDayEvents: Math.max(numbers.maxDayEvents, bucket.events.length),
        extraAllDayEvents: Math.max(numbers.extraAllDayEvents, bucket.events.length - MIN_EVENTS),
      }
    },
    { maxDayEvents: 0, extraAllDayEvents: 0 },
  )

  function handleShowAllDayEvents(value: boolean): void {
    setShowAllDayEvents(value)
  }

  return (
    <Box sx={{ display: 'flex', pr: 2 }}>
      <Box sx={{ maxWidth: 57, flex: '1 1 100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ maxHeight: 70, flex: '1 1 100%' }} />
        <Box
          sx={{
            flex: '1 1 100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {!!extraAllDayEvents && (
            <Box>
              <Tooltip title='Expand all-day events'>
                <IconButton
                  size='small'
                  onClick={() => {
                    handleShowAllDayEvents(!showAllDayEvents)
                  }}
                >
                  <ExpandMoreIcon
                    sx={{
                      transition: (theme) =>
                        theme.transitions.create('all', {
                          duration: theme.transitions.duration.standard,
                        }),
                      transform: showAllDayEvents ? 'rotate(-180deg)' : 'rotate(0deg)',
                    }}
                    fontSize='inherit'
                  />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
      {buckets.map((bucket, index) => (
        <WeekHeaderDay
          key={index}
          date={bucket.day}
          events={bucket.events}
          maxEvents={maxDayEvents}
          highlightedEvent={selectedEvent}
          showAllDayEvents={showAllDayEvents}
          hasCollapsedEvents={!!extraAllDayEvents}
          onShowAllEventChange={handleShowAllDayEvents}
          onCreateAllDayEvent={onCreateAllDayEvent}
          onEventOver={(e) => {
            setSelectedEvent(e)
          }}
          onEventOut={(e) => {
            setSelectedEvent(null)
          }}
        />
      ))}
    </Box>
  )
}
