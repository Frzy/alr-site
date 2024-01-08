import { useCalendar } from '@/hooks/useCalendar'
import type { ICalendarEvent } from '@/types/common'
import { getCalendarEventTypeIcon, parseLocationString } from '@/utils/calendar'
import { isMemberAdmin } from '@/utils/member'
import { useDraggable, type UseDraggableArguments } from '@dnd-kit/core'
import {
  lighten,
  type ButtonBaseProps,
  type SvgIconProps,
  darken,
  Stack,
  Typography,
  ButtonBase,
  Box,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import React from 'react'

interface CalendarTimedEventProps extends Omit<DraggableTimedEventProps, 'onClick'> {
  draggable?: boolean
  onClick?: (event: ICalendarEvent) => void
}
interface DraggableTimedEventProps extends TimedEventProps {
  dragOptions?: UseDraggableArguments
  disableDragTransform?: boolean
}
interface TimedEventProps extends ButtonBaseProps {
  event: ICalendarEvent
  hourHeight?: number
  iconProps?: SvgIconProps
  hoverColor?: string
  variant?: 'block' | 'inline'
}

export default function CalendarTimedEvent({
  draggable,
  event,
  onClick,
  disableDragTransform,
  dragOptions,
  ...other
}: CalendarTimedEventProps): JSX.Element {
  const { setEventId } = useCalendar()
  const { data: session } = useSession()
  const isAdmin = isMemberAdmin(session?.user)

  function handleOnClick(clickEvent: React.MouseEvent<HTMLButtonElement>): void {
    clickEvent.stopPropagation()
    setEventId(event.id)

    if (onClick) onClick(event)
  }

  return isAdmin && draggable ? (
    <DraggableTimedEvent
      event={event}
      onClick={handleOnClick}
      dragOptions={dragOptions}
      disableDragTransform={disableDragTransform}
      {...other}
    />
  ) : (
    <TimedEvent {...other} event={event} onClick={handleOnClick} />
  )
}

function DraggableTimedEvent({
  event,
  dragOptions,
  disableDragTransform,
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
      sx={{
        ...sx,
        ...(isDragging
          ? {
              backgroundColor: 'rgba(0, 255, 0, 0.25)',
              transition: 'none',
              transform: disableDragTransform
                ? undefined
                : `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 0, 0.25)',
              },
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
  { event, hourHeight = 48, iconProps, sx, variant = 'block', ...boxProps },
  ref,
) {
  const { backgroundColor, hoverColor, textColor, duration, location, title, time, icon } =
    React.useMemo(() => {
      const backgroundColor: string = variant === 'block' ? event.color : 'inherit'
      const locString = event.location ? parseLocationString(event.location) : ''
      const endFormat = 'h:mma'
      let startFormat = 'h:mm'

      if (event.startDate.format('a') !== event.endDate.format('a')) {
        startFormat = 'h:mma'
      }

      return {
        backgroundColor:
          variant === 'inline'
            ? backgroundColor
            : event.isPastEvent
              ? darken(backgroundColor, 0.75)
              : backgroundColor,
        hoverColor:
          variant === 'block'
            ? event.isPastEvent
              ? darken(backgroundColor, 0.35)
              : lighten(backgroundColor, 0.25)
            : 'rgba(255, 255, 255, 0.08)',
        textColor: event.isPastEvent ? 'text.secondary' : event.textColor,
        icon: getCalendarEventTypeIcon(event.eventType, {
          sx: { color: event.isPastEvent ? darken(event.color as string, 0.35) : event.color },
          ...iconProps,
        }),
        title: event.summary ?? '(No Title)',
        duration: event.endDate.diff(event.startDate, 'minutes'),
        location: Array.isArray(locString) ? locString[0] : locString,
        time:
          variant === 'block'
            ? `${event.startDate.format(startFormat)} \u2013 ${event.endDate.format(endFormat)}`
            : event.startDate.format('h:mma'),
      }
    }, [event, iconProps, variant])

  return (
    <ButtonBase
      ref={ref}
      {...boxProps}
      sx={{
        position: variant === 'block' ? 'absolute' : undefined,
        backgroundColor,
        color: textColor,
        transition: (theme) =>
          theme.transitions.create('backgroundColor', {
            duration: theme.transitions.duration.standard,
          }),
        '&:hover': {
          backgroundColor: hoverColor,
        },
        borderRadius: 0.75,
        px: 0.5,
        cursor: 'pointer',
        border: variant === 'block' ? '1px solid rgba(0, 0, 0, 0.25)' : undefined,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: variant === 'inline' ? '100%' : undefined,
        ...sx,
      }}
    >
      {variant === 'block' ? (
        <Box component={'span'} sx={{ overflow: 'hidden' }}>
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
        </Box>
      ) : (
        <Box
          component={'span'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '6px',
            overflow: 'hidden',
          }}
        >
          {icon}
          <Typography component='span' variant='caption' fontWeight='fontWeightBold' noWrap>
            {`${time} ${title}`}
          </Typography>
        </Box>
      )}
    </ButtonBase>
  )
})
