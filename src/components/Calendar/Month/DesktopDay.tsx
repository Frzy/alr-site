import React from 'react'
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material'
import dayjs, { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'
import { useDroppable } from '@dnd-kit/core'
import { sortDayEvents } from '@/utils/calendar'
import EventMenu from '../EventMenu'
import CalendarAllDayEvent from '../AllDayEvent'
import CalendarTimedEvent from '../TimedEvent'
import { useSession } from 'next-auth/react'
import { isMemberAdmin } from '@/utils/member'

interface DesktopMonthDayProps {
  activeMonth: number
  date: Dayjs
  events: ICalendarEvent[]
  selected?: boolean
  maxEvents?: number
  highlightedEvent?: ICalendarEvent | null
  onDateClick?: (date: Dayjs) => void
  onEventCreate?: (date: Dayjs) => void
  onEventClick?: (event: ICalendarEvent) => void
  onEventOut?: (event: ICalendarEvent) => void
  onEventOver?: (event: ICalendarEvent) => void
}

const DAY_ICON_WIDTH = { width: 32, height: 32 }
const MONTH_DAY_ICON_WIDTH = { width: 64, height: 32 }

function EventPlaceholder(): JSX.Element {
  return <Box height={24} width='100%' mb='2px' />
}

function MoreEventButton({
  numOfEvents,
  onClick,
}: {
  numOfEvents: number
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
}): JSX.Element {
  return (
    <Chip
      label={`${numOfEvents} More`}
      onClick={onClick}
      size='small'
      sx={{
        touchAction: 'none',
        border: 'none',
        mb: '2px',
        borderRadius: 0.75,
        justifyContent: 'flex-start',
        backgroundColor: 'inherit',
        px: 0.5,
      }}
    />
  )
}

export default function DesktopMonthDay({
  date,
  activeMonth,
  selected,
  events: data,
  maxEvents = Infinity,
  highlightedEvent,
  onEventOver,
  onEventOut,
  onEventClick,
  onEventCreate,
}: DesktopMonthDayProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({
    id: date.format(),
  })
  const events = React.useMemo(() => {
    return sortDayEvents(data)
  }, [data])
  const { data: session } = useSession()
  const dayRef = React.useRef<HTMLDivElement | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)
  const isFirstOfMonth = date.get('date') === 1
  const isActiveMonth = date.month() === activeMonth
  const isToday = dayjs().isSame(date, 'day')
  const isAdmin = isMemberAdmin(session?.user)

  function handleShowMoreEvents(clickEvent: React.MouseEvent<HTMLDivElement>): void {
    clickEvent.stopPropagation()
    if (dayRef.current) setAnchorEl(dayRef.current)
  }

  function handleEventMenuClose(): void {
    setAnchorEl(null)
  }

  return (
    <React.Fragment>
      <Box
        ref={setNodeRef}
        onClick={
          isAdmin
            ? (event) => {
                if (onEventCreate) onEventCreate(date)
              }
            : undefined
        }
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: 0.5,
          width: '100%',
          gap: '2px',
        }}
      >
        <Box sx={{ textAlign: 'center' }} ref={dayRef}>
          <IconButton
            disabled={isOver}
            href={`/calendar/day?date=${date.format('YYYY-MM-DD')}`}
            onClick={(event) => {
              event.stopPropagation()
            }}
            color={selected ? 'primary' : 'default'}
            sx={{
              ...(isFirstOfMonth ? MONTH_DAY_ICON_WIDTH : DAY_ICON_WIDTH),
              backgroundColor: isToday ? 'primary.main' : undefined,
              '&:hover': {
                backgroundColor: isToday ? 'primary.dark' : undefined,
              },
            }}
          >
            <Typography
              sx={{
                color: isActiveMonth
                  ? selected && !isToday
                    ? 'primary.main'
                    : 'text.primary'
                  : 'rgba(255, 255, 255, 0.25)',
                fontSize: '.95rem',
              }}
            >
              {isFirstOfMonth ? date.format('MMM D') : date.format('D')}
            </Typography>
          </IconButton>
        </Box>
        <Stack sx={{ px: 0.5 }} spacing={0.25}>
          {events.slice(0, maxEvents).map((e, index) => {
            if (!!e?.isAllDayEvent || !!e?.isMultipleDayEvent) {
              return (
                <CalendarAllDayEvent
                  key={e.id}
                  event={e}
                  selected={!anchorEl && highlightedEvent?.id === e.id}
                  draggable
                  onClick={onEventClick}
                  onMouseOver={() => {
                    if (onEventOver) onEventOver(e)
                  }}
                  onMouseOut={() => {
                    if (onEventOut) onEventOut(e)
                  }}
                  hasLeftArrow={e.startDate.isBefore(date)}
                  hasRightArrow={
                    e.isAllDayEvent
                      ? e.endDate.isAfter(date.add(1, 'day').startOf('day'))
                      : e.endDate.isAfter(date.endOf('day'))
                  }
                />
              )
            } else if (e) {
              return (
                <CalendarTimedEvent
                  key={e.id}
                  event={e}
                  variant='inline'
                  onClick={onEventClick}
                  draggable
                  disableDragTransform
                />
              )
            }

            return <EventPlaceholder key={index} />
          })}
          {maxEvents < events.length && (
            <MoreEventButton
              numOfEvents={events.length - maxEvents}
              onClick={handleShowMoreEvents}
            />
          )}
        </Stack>
      </Box>
      {maxEvents < events.length && (
        <EventMenu
          date={date}
          events={events.filter(Boolean) as ICalendarEvent[]}
          onEventOver={onEventOver}
          onEventOut={onEventOut}
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={handleEventMenuClose}
        />
      )}
    </React.Fragment>
  )
}
