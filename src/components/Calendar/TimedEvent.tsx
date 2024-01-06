import { useCalendar } from '@/hooks/useCalendar'
import type { ICalendarEvent } from '@/types/common'
import { getCalendarEventTypeIcon, parseLocationString } from '@/utils/calendar'
import { useDraggable, type UseDraggableArguments } from '@dnd-kit/core'
import {
  lighten,
  type ButtonBaseProps,
  type SvgIconProps,
  darken,
  Stack,
  Typography,
  ButtonBase,
} from '@mui/material'
import React from 'react'

interface CalendarTimedEventProps extends Omit<TimedEventProps, 'onClick'> {
  draggable?: boolean
  dragOptions?: UseDraggableArguments
  event: ICalendarEvent
  onClick?: (event: ICalendarEvent) => void
}
interface DraggableTimedEventProps extends TimedEventProps {
  dragOptions?: UseDraggableArguments
}
interface TimedEventProps extends ButtonBaseProps {
  event: ICalendarEvent
  hourHeight?: number
  iconProps?: SvgIconProps
  backgroundColor?: string
  hoverColor?: string
}

export default function CalendarTimedEvent({
  draggable,
  dragOptions,
  event,
  onClick,
  ...other
}: CalendarTimedEventProps): JSX.Element {
  const { setEventId } = useCalendar()

  function handleOnClick(clickEvent: React.MouseEvent<HTMLButtonElement>): void {
    clickEvent.stopPropagation()
    setEventId(event.id)

    if (onClick) onClick(event)
  }

  return draggable && dragOptions ? (
    <DraggableTimedEvent
      event={event}
      dragOptions={dragOptions}
      onClick={handleOnClick}
      {...other}
    />
  ) : (
    <TimedEvent {...other} event={event} onClick={handleOnClick} />
  )
}

function DraggableTimedEvent({
  event,
  dragOptions,
  sx,
  ...other
}: DraggableTimedEventProps): JSX.Element {
  const { listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: event.id,
    ...dragOptions,
  })

  return (
    <TimedEvent
      {...other}
      {...listeners}
      event={event}
      ref={setNodeRef}
      backgroundColor={isDragging ? 'rgba(0, 255, 0, 0.25)' : undefined}
      sx={{
        ...sx,
        ...(isDragging
          ? {
              transition: 'none',
              transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
              left: 0,
              width: '100%',
              zIndex: 1000,
            }
          : {}),
      }}
    />
  )
}

const TimedEvent = React.forwardRef<HTMLButtonElement, TimedEventProps>(function TimedEvent(
  { event, hourHeight = 48, iconProps, backgroundColor, hoverColor, sx, ...boxProps },
  ref,
) {
  const { bgcolor, duration, location, title, time } = React.useMemo(() => {
    const bgcolor: string = backgroundColor ?? event.color
    const locString = event.location ? parseLocationString(event.location) : ''
    const endFormat = 'h:mma'
    let startFormat = 'h:mm'

    if (event.startDate.format('a') !== event.endDate.format('a')) {
      startFormat = 'h:mma'
    }

    return {
      bgcolor,
      icon: getCalendarEventTypeIcon(event.eventType, iconProps),
      title: event.summary ?? '(No Title)',
      duration: event.endDate.diff(event.startDate, 'minutes'),
      location: Array.isArray(locString) ? locString[0] : locString,
      time: `${event.startDate.format(startFormat)} \u2013 ${event.endDate.format(endFormat)}`,
    }
  }, [event, iconProps, backgroundColor])

  return (
    <ButtonBase
      ref={ref}
      {...boxProps}
      sx={{
        position: 'absolute',
        backgroundColor: event.isPastEvent ? darken(bgcolor, 0.75) : bgcolor,
        color: event.textColor,
        transition: (theme) =>
          theme.transitions.create('backgroundColor', {
            duration: theme.transitions.duration.standard,
          }),
        '&:hover': {
          backgroundColor: event.isPastEvent ? darken(bgcolor, 0.35) : lighten(bgcolor, 0.25),
        },
        borderRadius: 0.75,
        px: 0.5,
        cursor: 'pointer',
        border: '1px solid rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        ...sx,
      }}
    >
      {duration > 60 ? (
        <Stack sx={{ width: '100%', textAlign: 'left' }}>
          <Typography
            variant='caption'
            component='div'
            fontWeight='fontWeightBold'
            lineHeight={1.4}
            noWrap
          >
            {title}
          </Typography>
          <Typography variant='caption' component='div' lineHeight={1.4} noWrap>
            {time}
          </Typography>
          {location && (
            <Typography variant='caption' component='div' lineHeight={1.4} noWrap>
              {location}
            </Typography>
          )}
        </Stack>
      ) : duration > 45 ? (
        <Stack sx={{ width: '100%', textAlign: 'left' }}>
          <Typography
            variant='caption'
            component='div'
            fontWeight='fontWeightBold'
            lineHeight={1.4}
            noWrap
          >
            {title}
          </Typography>
          <Typography variant='caption' component='div' lineHeight={1.4} noWrap>
            {`${time}${location ? `, ${location}` : ''}`}
          </Typography>
        </Stack>
      ) : duration > 30 ? (
        <Stack sx={{ width: '100%', textAlign: 'left' }}>
          <Typography
            variant='caption'
            component='div'
            fontWeight='fontWeightBold'
            lineHeight={1.4}
            noWrap
          >
            {title}
          </Typography>
          <Typography variant='caption' component='div' lineHeight={1.4} noWrap>
            {`${time}${location ? `, ${location}` : ''}`}
          </Typography>
        </Stack>
      ) : duration > 15 ? (
        <Typography variant='caption' component='div' lineHeight={1.9} noWrap>
          <b>{title}</b> @ {time}
          {`${location ? `, ${location}` : ''}`}
        </Typography>
      ) : (
        <Typography variant='caption' component='div' lineHeight={0.9} noWrap>
          <b>{title}</b> @ {time}
          {`${location ? `, ${location}` : ''}`}
        </Typography>
      )}
    </ButtonBase>
  )
})
