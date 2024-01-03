import * as React from 'react'
import { ButtonBase, type ButtonBaseProps, darken } from '@mui/material'
import { getCalendarEventTypeIcon } from '@/utils/calendar'
import { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'

export const ARROW_SIZE = 8
interface AllDayEventProps extends ButtonBaseProps {
  date: Dayjs
  event: ICalendarEvent
  height?: number
  onEventClick?: (event: ICalendarEvent) => void
}
export default function AllDayEvent({
  date,
  event,
  height = 24,
  onEventClick,
  sx,
  ...other
}: AllDayEventProps): JSX.Element {
  const icon = React.useMemo(() => {
    return getCalendarEventTypeIcon(event.eventType)
  }, [event])
  const hasBefore = event.startDate.isBefore(date)
  const hasAfter = event.isAllDayEvent
    ? event.endDate.isAfter(date.add(1, 'day').startOf('day'))
    : event.endDate.isAfter(date.endOf('day'))
  const title = event.summary ?? '(No Title)'

  function handleEventClick(clickEvent: React.MouseEvent<HTMLButtonElement>): void {
    clickEvent.stopPropagation()
    if (onEventClick) onEventClick(event)
  }

  return (
    <ButtonBase
      {...other}
      onClick={handleEventClick}
      sx={{
        ...sx,
        bgcolor: event.color,
        width: `calc(100% - ${hasBefore ? ARROW_SIZE * 2 : ARROW_SIZE}px)`,
        height,
        transition: (theme) =>
          theme.transitions.create('all', { duration: theme.transitions.duration.standard }),
        marginLeft: hasBefore ? `${ARROW_SIZE}px !important` : 0,
        justifyContent: 'flex-start',
        pl: hasBefore ? 0.5 : 2,
        gap: 1,
        borderTopLeftRadius: hasBefore ? 0 : 2,
        borderBottomLeftRadius: hasBefore ? 0 : 2,
        borderTopRightRadius: hasAfter ? 0 : 2,
        borderBottomRightRadius: hasAfter ? 0 : 2,
        ':hover': {
          bgcolor: darken(event.color as string, 0.25),
        },
        '&:hover:before': {
          borderRight: `${ARROW_SIZE}px solid ${darken(event.color as string, 0.25)}`,
        },
        ':before': hasBefore
          ? {
              content: '""',
              position: 'absolute',
              height: 0,
              width: 0,
              left: -height + (height / 2 - ARROW_SIZE),
              top: 0,
              border: `${height / 2}px solid transparent`,
              borderRight: `${ARROW_SIZE}px solid ${event.color}`,
              transition: (theme) =>
                theme.transitions.create('all', { duration: theme.transitions.duration.standard }),
            }
          : undefined,
        '&:hover:after': {
          borderLeft: `12px solid ${darken(event.color as string, 0.25)}`,
        },
        ':after': hasAfter
          ? {
              content: '""',
              position: 'absolute',
              height: 0,
              width: 0,
              left: '100%',
              top: 0,
              border: `${height / 2}px solid transparent`,
              borderLeft: `${ARROW_SIZE}px solid ${event.color}`,
              transition: (theme) =>
                theme.transitions.create('all', { duration: theme.transitions.duration.standard }),
            }
          : undefined,
      }}
    >
      {icon}
      {event.isAllDayEvent ? title : `${title}, ${event.startDate.format('h:mma')}`}
    </ButtonBase>
  )
}
