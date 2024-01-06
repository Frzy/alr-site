import * as React from 'react'
import { ButtonBase, type ButtonBaseProps, darken } from '@mui/material'
import { getCalendarEventTypeIcon } from '@/utils/calendar'
import dayjs, { type Dayjs } from 'dayjs'
import type { ICalendarEvent } from '@/types/common'
import { useDraggable } from '@dnd-kit/core'

export const ARROW_SIZE = 8
interface AllDayEventProps extends ButtonBaseProps {
  date?: Dayjs
  disabledArrows?: boolean
  event: ICalendarEvent
  height?: number
  draggable?: boolean
  onEventClick?: (event: ICalendarEvent) => void
}
export default function AllDayEvent({
  date = dayjs(),
  disabledArrows,
  draggable,
  event,
  height = 24,
  onEventClick,
  sx,
  ...other
}: AllDayEventProps): JSX.Element {
  const { listeners, setNodeRef, isDragging } = useDraggable({
    id: event?.id ?? '',
    data: { allDayEvent: true },
  })
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
      ref={draggable ? setNodeRef : undefined}
      {...other}
      {...(draggable ? listeners : {})}
      onClick={handleEventClick}
      sx={{
        ...sx,
        bgcolor: isDragging ? 'rgba(0, 255, 0, 0.25)' : event.color,
        width: disabledArrows
          ? '100%'
          : `calc(100% - ${hasBefore ? ARROW_SIZE * 2 : ARROW_SIZE}px)`,
        height,
        transition: (theme) =>
          theme.transitions.create('all', { duration: theme.transitions.duration.standard }),
        marginLeft: !disabledArrows && hasBefore ? `${ARROW_SIZE}px !important` : 0,
        justifyContent: 'flex-start',
        pl: disabledArrows ?? hasBefore ? 0.5 : 2,
        gap: 1,
        borderTopLeftRadius: !disabledArrows && hasBefore ? 0 : 2,
        borderBottomLeftRadius: !disabledArrows && hasBefore ? 0 : 2,
        borderTopRightRadius: !disabledArrows && hasAfter ? 0 : 2,
        borderBottomRightRadius: !disabledArrows && hasAfter ? 0 : 2,
        ':hover': {
          bgcolor: darken(event.color as string, 0.25),
        },
        '&:hover:before': {
          borderRight: `${ARROW_SIZE}px solid ${darken(event.color as string, 0.25)}`,
        },
        ':before':
          !disabledArrows && hasBefore
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
                  theme.transitions.create('all', {
                    duration: theme.transitions.duration.standard,
                  }),
              }
            : undefined,
        '&:hover:after': {
          borderLeft: `12px solid ${darken(event.color as string, 0.25)}`,
        },
        ':after':
          !disabledArrows && hasAfter
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
                  theme.transitions.create('all', {
                    duration: theme.transitions.duration.standard,
                  }),
              }
            : undefined,
      }}
    >
      {icon}
      {event.isAllDayEvent ? title : `${title}, ${event.startDate.format('h:mma')}`}
    </ButtonBase>
  )
}
