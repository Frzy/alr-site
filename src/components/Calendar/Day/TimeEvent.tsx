import { Box, Typography, type BoxProps, darken, Stack, lighten, alpha } from '@mui/material'
import { parseLocationString } from '@/utils/calendar'
import { useDraggable } from '@dnd-kit/core'
import React from 'react'
import type { ICalendarEvent } from '@/types/common'

interface TimeEventProps extends Omit<BoxProps, 'onClick'> {
  event: ICalendarEvent
  onClick?: (event: ICalendarEvent) => void
}

export default function TimeEvent({ event, onClick, ...other }: TimeEventProps): JSX.Element {
  const { listeners, setNodeRef, isDragging, transform } = useDraggable({ id: event?.id ?? '' })
  const duration = event.endDate.diff(event.startDate, 'minutes')
  const title = event.summary ? event.summary : '(No Title)'
  const location = React.useMemo(() => {
    const locString = event.location ? parseLocationString(event.location) : ''

    if (Array.isArray(locString)) return locString[0]

    return locString
  }, [event])
  const time = React.useMemo(() => {
    const endFormat = 'h:mma'
    let startFormat = 'h:mm'

    if (event.startDate.format('a') !== event.endDate.format('a')) {
      startFormat = 'h:mma'
    }

    return `${event.startDate.format(startFormat)} \u2013 ${event.endDate.format(endFormat)}`
  }, [event])

  function handleEventClick(clickEvent: React.MouseEvent<HTMLElement>): void {
    clickEvent.stopPropagation()
    if (onClick) onClick(event)
  }

  return (
    <Box
      {...other}
      ref={setNodeRef}
      {...listeners}
      position='absolute'
      sx={{
        transform: isDragging ? `translate3d(0px, ${transform?.y}px, 0)` : undefined,
        touchAction: 'none',
        backgroundColor: isDragging
          ? alpha(event.color as string, 0.5)
          : event.isPastEvent
            ? lighten(event.color as string, 0.4)
            : event.color,
        color: event.textColor,
        transition: isDragging
          ? undefined
          : (theme) =>
              theme.transitions.create('all', { duration: theme.transitions.duration.standard }),
        '&:hover': {
          backgroundColor: isDragging
            ? undefined
            : darken(
                event.isPastEvent ? lighten(event.color as string, 0.4) : (event.color as string),
                0.25,
              ),
        },
        borderRadius: 1,
        px: 0.5,
        cursor: 'pointer',
        border: '1px solid rgba(0, 0, 0, 0.25)',
        ...other.sx,
        ...(isDragging ? { left: 0, width: '100%' } : {}),
        display: 'flex',
        alignItems: 'flex-start',
      }}
      onClick={handleEventClick}
    >
      {duration > 60 ? (
        <Stack>
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
        <Stack>
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
        <Stack>
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
  )
}
