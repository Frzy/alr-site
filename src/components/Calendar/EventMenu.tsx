import type { ICalendarEvent } from '@/types/common'
import { Menu, Stack, type MenuProps, IconButton, Box, Typography } from '@mui/material'
import CalendarAllDayEvent from './AllDayEvent'
import CalendarTimedEvent from './TimedEvent'
import { type Dayjs } from 'dayjs'

interface EventMenuProps extends Omit<MenuProps, 'onClick'> {
  events?: ICalendarEvent[]
  date: Dayjs
  onEventOut?: (event: ICalendarEvent) => void
  onEventOver?: (event: ICalendarEvent) => void
  onClose?: (
    event: Record<string, never>,
    reason: 'backdropClick' | 'escapeKeyDown' | 'eventClick',
  ) => void
}

export default function EventMenu({
  date,
  events = [],
  onClose,
  onEventOver,
  onEventOut,
  ...props
}: EventMenuProps): JSX.Element {
  function handleEventClick(): void {
    if (onClose) onClose({}, 'eventClick')
  }

  return (
    <Menu
      sx={{ '& .MuiList-root': { p: 0 } }}
      slotProps={{
        paper: { sx: { p: 1, minWidth: 200 } },
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={onClose}
      {...props}
    >
      <Stack spacing={0.25}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pb: 0.5,
          }}
        >
          <Typography>{date.format('ddd')}</Typography>
          <IconButton
            sx={{ width: 48, height: 48, fontSize: '2rem' }}
            href={`/calendar/day?date=${date.format('YYYY-MM-DD')}`}
          >
            {date.format('D')}
          </IconButton>
        </Box>
        {events.map((event) => {
          if (event.isAllDayEvent || event.isMultipleDayEvent) {
            return (
              <CalendarAllDayEvent
                key={event.id}
                event={event}
                onClick={handleEventClick}
                onMouseOver={() => {
                  if (onEventOver) onEventOver(event)
                }}
                onMouseOut={() => {
                  if (onEventOut) onEventOut(event)
                }}
                hasLeftArrow={event.startDate.isBefore(date)}
                hasRightArrow={
                  event.isAllDayEvent
                    ? event.endDate.isAfter(date.add(1, 'day').startOf('day'))
                    : event.endDate.isAfter(date.endOf('day'))
                }
              />
            )
          }

          return (
            <CalendarTimedEvent
              key={event.id}
              event={event}
              variant='inline'
              onClick={handleEventClick}
            />
          )
        })}
      </Stack>
    </Menu>
  )
}
