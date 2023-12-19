import * as React from 'react'
import moment, { Moment } from 'moment'

import { Box, BoxProps } from '@mui/material'
import CalendarHeader from './calendar.header'
import MonthCalendar from './calendar.month'
import CalendarTimeline from './calendar.timeline'
import CalendarSchedule from './schedule'
import CalendarEventDialog from './calendar.event.dialog'
import { ICalendarEvent } from '@/types/common'
import { useRouter, withRouter } from 'next/router'

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
type CalendarQueryState = {
  view?: CALENDAR_VIEW
  date?: string
}

interface CalendarProps extends BoxProps {
  editable?: boolean
}
export default function Calendar({ editable, ...boxProps }: CalendarProps) {
  const router = useRouter()
  const [ready, setReady] = React.useState(false)
  const state: CalendarState = {
    view: router.query.view ? (router.query.view as CALENDAR_VIEW) : CALENDAR_VIEW.MONTH,
    date: router.query.date ? moment(router.query.date, 'YYYY-MM-DD') : moment(),
  }

  function getQueryParameters(): CalendarQueryState {
    return {
      ...state,
      date: state.date.format('YYYY-MM-DD'),
    }
  }

  function handleCalendarChange(updatedState: Partial<CalendarState>) {
    const newState = { ...state, ...updatedState }
    const query = {
      view: newState.view,
      date: newState.date.format('YYYY-MM-DD'),
    }
    router.push({
      pathname: router.pathname,
      query,
    })
  }

  React.useEffect(() => {
    setReady(router.isReady)
  }, [router.isReady])

  if (!ready) return null

  return (
    <Box display='flex' flexDirection='column' height='100%' minWidth={150} {...boxProps}>
      <CalendarHeader date={state.date} view={state.view} onCalendarChange={handleCalendarChange} />
      {state.view === CALENDAR_VIEW.MONTH && (
        <MonthCalendar date={state.date} flexGrow={1} onCalendarChange={handleCalendarChange} editable={editable} />
      )}
      {(state.view === CALENDAR_VIEW.WEEK || state.view === CALENDAR_VIEW.DAY) && (
        <CalendarTimeline
          date={state.date}
          mode={state.view}
          onCalendarChange={handleCalendarChange}
          editable={editable}
        />
      )}
      {state.view === CALENDAR_VIEW.SCHEDULE && (
        <CalendarSchedule
          date={state.date}
          onCalendarChange={handleCalendarChange}
          sx={{ pb: 3 }}
        />
      )}
    </Box>
  )
}