import * as React from 'react'
import moment, { Moment } from 'moment'

import { Box, BoxProps } from '@mui/material'
import CalendarHeader from './calendar.header'
import MonthCalendar from './calendar.month'
import CalendarTimeline, { ICalendarEvent } from './calendar.timeline'
import CalendarSchedule from './schedule'
import CalendarEventDialog from './calendar.event.dialog'

type View = 'month' | 'week' | 'day' | 'schedule'

export enum CALENDAR_VIEW {
  MONTH = 'month',
  WEEK = 'week',
  DAY = 'day',
  SCHEDULE = 'schedule',
}

export type CalendarState = {
  date: Moment
  view: CALENDAR_VIEW
}

interface CalendarProps extends BoxProps {}
export default function Calendar({ ...boxProps }: CalendarProps) {
  const [state, setState] = React.useState<CalendarState>({
    date: moment(),
    view: CALENDAR_VIEW.MONTH,
  })
  const [event, setEvent] = React.useState<ICalendarEvent>()

  function handleCalendarChange(state: Partial<CalendarState>) {
    setState((prev) => ({ ...prev, ...state }))
  }
  function handleEventClick(event: ICalendarEvent) {
    setEvent(event)
  }
  function handleCreateEvent(date: Moment) {
    console.log(date.format())
  }

  return (
    <Box display='flex' flexDirection='column' height='100%' minWidth={150} {...boxProps}>
      <CalendarHeader date={state.date} view={state.view} onCalendarChange={handleCalendarChange} />
      {state.view === CALENDAR_VIEW.MONTH && (
        <MonthCalendar
          date={state.date}
          flexGrow={1}
          onCalendarChange={handleCalendarChange}
          onCalendarCreateEvent={handleCreateEvent}
          onCalendarEventClick={handleEventClick}
        />
      )}
      {(state.view === CALENDAR_VIEW.WEEK || state.view === CALENDAR_VIEW.DAY) && (
        <CalendarTimeline
          date={state.date}
          mode={state.view}
          onCalendarChange={handleCalendarChange}
        />
      )}
      {state.view === CALENDAR_VIEW.SCHEDULE && (
        <CalendarSchedule
          date={state.date}
          onCalendarChange={handleCalendarChange}
          sx={{ pb: 3 }}
        />
      )}
      {event && (
        <CalendarEventDialog
          event={event}
          open={true}
          editable
          onClose={() => {
            setEvent(undefined)
          }}
        />
      )}
    </Box>
  )
}
