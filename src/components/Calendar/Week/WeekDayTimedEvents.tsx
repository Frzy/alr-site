import type { ICalendarEvent } from '@/types/common'
import { useDroppable } from '@dnd-kit/core'
import { Box } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import CalendarTimedEvent from '../TimedEvent'
import { getSortedTimelineEvents } from '@/utils/calendar'
import React from 'react'
import HelmetIcon from '@mui/icons-material/SportsMotorsports'

const RIGHT_PADDING = 8

interface WeekDayTimedEventsProps {
  disableBorder?: boolean
  date: Dayjs
  events?: ICalendarEvent[]
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>, date: Dayjs) => void
}

export default function WeekDayTimedEvents({
  disableBorder,
  date,
  events = [],
  onBackgroundClick,
}: WeekDayTimedEventsProps): JSX.Element {
  const now = dayjs()
  const isToday = now.isSame(date, 'day')
  const weekday = date.day()
  const { setNodeRef } = useDroppable({
    id: date.format(),
    data: {
      timedDroppable: true,
      weekday,
    },
  })
  const eventProps = React.useMemo(() => {
    return getSortedTimelineEvents(events)
  }, [events])

  function handleBackgroundClick(event: React.MouseEvent<HTMLDivElement>): void {
    if (onBackgroundClick) onBackgroundClick(event, date)
  }

  return (
    <Box
      ref={setNodeRef}
      onClick={handleBackgroundClick}
      sx={{
        flex: '1 1 100%',
        position: 'relative',
        borderLeft: (theme) => (disableBorder ? undefined : `1px solid ${theme.palette.divider}`),
      }}
    >
      {eventProps.map(({ event, top, height, left, width }, i) => (
        <CalendarTimedEvent
          key={i}
          event={event}
          draggable
          dragOptions={{ id: event.id, data: { timedEvent: true, weekday } }}
          sx={{
            top,
            height,
            left: `${left}%`,
            width: `calc(${width - left}% - ${RIGHT_PADDING}px)`,
            zIndex: i,
          }}
        />
      ))}
      {isToday && (
        <Box
          position='absolute'
          top={now.diff(now.startOf('day'), 'minutes') * (48 / 60)}
          left={6}
          bgcolor='red'
          height={2}
          right={0}
          zIndex={500}
        >
          <Box ml='-18px' mt='-12px'>
            <HelmetIcon
              sx={{
                color: 'red',
                transform: 'scaleX(-1)',
                height: 24,
                width: 24,
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}
