import { useCalendar } from '@/hooks/useCalendar'
import type { ICalendarEvent } from '@/types/common'
import { getCalendarEventTypeIcon } from '@/utils/calendar'
import { useDraggable, type UseDraggableArguments } from '@dnd-kit/core'
import { ButtonBase, darken, type ButtonBaseProps, type SvgIconProps } from '@mui/material'
import React from 'react'

interface AllDayEventProps extends ButtonBaseProps {
  event: ICalendarEvent
  hasLeftArrow?: boolean | (() => boolean)
  hasRightArrow?: boolean | (() => boolean)
  arrowWidth?: number
  eventHeight?: number
  iconProps?: SvgIconProps
  backgroundColor?: string
  selected?: boolean
}

interface DraggableEventProps extends AllDayEventProps {
  dragOptions?: UseDraggableArguments
}

interface CalendarAllDayEventProps extends Omit<AllDayEventProps, 'onClick'> {
  draggable?: boolean
  dragOptions?: UseDraggableArguments
  event: ICalendarEvent
  onClick?: (event: ICalendarEvent) => void
}

export default function CalendarAllDayEvent({
  draggable,
  dragOptions,
  event,
  onClick,
  ...other
}: CalendarAllDayEventProps): JSX.Element {
  const { setEventId } = useCalendar()

  function handleOnClick(clickEvent: React.MouseEvent<HTMLButtonElement>): void {
    clickEvent.stopPropagation()
    setEventId(event.id)

    if (onClick) onClick(event)
  }

  return draggable && dragOptions ? (
    <DraggableEvent event={event} dragOptions={dragOptions} onClick={handleOnClick} {...other} />
  ) : (
    <AllDayEvent {...other} event={event} onClick={handleOnClick} />
  )
}

function DraggableEvent({ event, dragOptions, ...other }: DraggableEventProps): JSX.Element {
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: event.id, ...dragOptions })

  return (
    <AllDayEvent
      event={event}
      ref={setNodeRef}
      backgroundColor={isDragging ? 'rgba(0, 255, 0, 0.25)' : undefined}
      {...other}
      {...listeners}
    />
  )
}

const AllDayEvent = React.forwardRef<HTMLButtonElement, AllDayEventProps>(function AllDayEvent(
  {
    event,
    hasLeftArrow: getLeftArrow,
    hasRightArrow: getRightArrow,
    arrowWidth = 8,
    eventHeight = 24,
    iconProps,
    backgroundColor: initBackgroundColor,
    sx,
    selected,
    ...buttonProps
  },
  ref,
) {
  const { backgroundColor, hoverColor, textColor, icon, title } = React.useMemo(() => {
    const bgcolor: string = initBackgroundColor ?? event.color

    return {
      backgroundColor: event.isPastEvent ? darken(bgcolor, 0.75) : bgcolor,
      hoverColor: event.isPastEvent ? darken(bgcolor, 0.35) : darken(bgcolor, 0.35),
      textColor: event.isPastEvent ? 'text.secondary' : event.textColor,
      icon: getCalendarEventTypeIcon(event.eventType, iconProps),
      title: event.summary
        ? event.isAllDayEvent
          ? event.summary
          : `${event.startDate.format('h:mma')} ${event.summary}`
        : '(No Title)',
    }
  }, [event, iconProps, initBackgroundColor])
  const hasLeftArrow = typeof getLeftArrow === 'function' ? getLeftArrow() : getLeftArrow
  const hasRightArrow = typeof getRightArrow === 'function' ? getRightArrow() : getRightArrow

  return (
    <ButtonBase
      ref={ref}
      {...buttonProps}
      sx={{
        backgroundColor: selected ? hoverColor : backgroundColor,
        color: textColor,
        ':hover': {
          backgroundColor: hoverColor,
        },
        transition: (theme) =>
          theme.transitions.create('all', { duration: theme.transitions.duration.standard }),
        justifyContent: 'flex-start',
        gap: 0.5,
        pl: 0.5,
        ...sx,
        height: eventHeight,
        width: `calc(100% - ${hasLeftArrow ? arrowWidth * 2 : arrowWidth}px)`,
        ml: hasLeftArrow ? `${arrowWidth}px !important` : 0,
        borderTopLeftRadius: hasLeftArrow ? 0 : 2,
        borderBottomLeftRadius: hasLeftArrow ? 0 : 2,
        borderTopRightRadius: hasRightArrow ? 0 : 2,
        borderBottomRightRadius: hasRightArrow ? 0 : 2,
        '&:hover:before': {
          borderRight: `${arrowWidth}px solid ${hoverColor}`,
        },
        ':before': hasLeftArrow
          ? {
              content: '""',
              position: 'absolute',
              height: 0,
              width: 0,
              left: -eventHeight + (eventHeight / 2 - arrowWidth),
              top: 0,
              border: `${eventHeight / 2}px solid transparent`,
              borderRight: `${arrowWidth}px solid ${selected ? hoverColor : backgroundColor}`,
              transition: (theme) =>
                theme.transitions.create('all', {
                  duration: theme.transitions.duration.standard,
                }),
            }
          : undefined,
        '&:hover:after': {
          borderLeft: `${arrowWidth}px solid ${hoverColor}`,
        },
        ':after': hasRightArrow
          ? {
              content: '""',
              position: 'absolute',
              height: 0,
              width: 0,
              left: '100%',
              top: 0,
              border: `${eventHeight / 2}px solid transparent`,
              borderLeft: `${arrowWidth}px solid ${selected ? hoverColor : backgroundColor}`,
              transition: (theme) =>
                theme.transitions.create('all', {
                  duration: theme.transitions.duration.standard,
                }),
            }
          : undefined,
      }}
    >
      {icon}
      {title}
    </ButtonBase>
  )
})
