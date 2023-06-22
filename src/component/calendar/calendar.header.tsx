import * as React from 'react'
import moment, { Moment } from 'moment'
import {
  Button,
  Box,
  BoxProps,
  IconButton,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

import { CALENDAR_VIEW, CalendarState } from './calendar'

type CalendarHeaderProps = {
  date?: Moment
  view?: CALENDAR_VIEW
  onCalendarChange?: (state: CalendarState) => void
} & Omit<BoxProps, 'onChange'>

export default function CalendarHeader({
  date = moment(),
  view = CALENDAR_VIEW.MONTH,
  onCalendarChange,
}: CalendarHeaderProps) {
  function handleViewChange(event: SelectChangeEvent) {
    handleCalendarChange(date, event.target.value as CALENDAR_VIEW)
  }
  function handleTodayClick() {
    handleCalendarChange(moment(), view)
  }
  function handleMoveDateBack() {
    const toAdd = view === CALENDAR_VIEW.SCHEDULE ? CALENDAR_VIEW.DAY : view
    handleCalendarChange(moment(date).subtract(1, toAdd), view)
  }
  function handleMoveDateForward() {
    const toAdd = view === CALENDAR_VIEW.SCHEDULE ? CALENDAR_VIEW.DAY : view
    handleCalendarChange(moment(date).add(1, toAdd), view)
  }
  function handleCalendarChange(date: Moment, view: CALENDAR_VIEW) {
    if (onCalendarChange) onCalendarChange({ date, view })
  }

  function getDateFormat() {
    let monthOverlap: boolean
    switch (view) {
      case CALENDAR_VIEW.SCHEDULE:
        const scheduleStart = moment(date)
        const scheduleEnd = moment(date).add(1, 'month')
        monthOverlap = scheduleStart.month() !== scheduleEnd.month()

        return monthOverlap
          ? `[${scheduleStart.format('MMM')} – ${scheduleEnd.format('MMM')}] YYYY`
          : 'MMMM YYYY'
      case CALENDAR_VIEW.MONTH:
        return 'MMMM YYYY'
      case CALENDAR_VIEW.DAY:
        return 'MMMM D, YYYY'
      case CALENDAR_VIEW.WEEK:
        const start = moment(date).day(0)
        const end = moment(date).day(6)
        monthOverlap = start.month() !== end.month()

        return monthOverlap ? `[${start.format('MMM')} – ${end.format('MMM')}] YYYY` : 'MMMM YYYY'
    }
  }

  return (
    <Box display='flex' p={1}>
      <Button
        variant='outlined'
        sx={{ minWidth: 100, display: { xs: 'none', sm: 'inherit' } }}
        onClick={handleTodayClick}
      >
        Today
      </Button>
      <Box
        flexGrow={1}
        display='flex'
        sx={{
          gap: { xs: 0.5, md: 1 },
          justifyContent: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <IconButton onClick={handleMoveDateBack} title='Go Back' size='small'>
          <ChevronLeftIcon />
        </IconButton>
        <DatePicker
          sx={{
            '& .MuiInputBase-root': {
              height: 36.5,
              minWidth: 150,
            },
          }}
          format={getDateFormat()}
          value={date}
          views={view === CALENDAR_VIEW.MONTH ? ['year', 'month'] : ['year', 'month', 'day']}
          openTo={
            view === CALENDAR_VIEW.MONTH || view === CALENDAR_VIEW.SCHEDULE
              ? CALENDAR_VIEW.MONTH
              : CALENDAR_VIEW.DAY
          }
          onAccept={(value: Moment | null) => {
            if (value) handleCalendarChange(value, view)
          }}
        />
        <IconButton onClick={handleMoveDateForward} title='Go Forward' size='small'>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <FormControl sx={{ minWidth: 120, pl: { xs: 1, sm: 0 } }} size='small'>
        <Select id='calendar-view' value={view} onChange={handleViewChange}>
          <MenuItem value={CALENDAR_VIEW.DAY}>Day</MenuItem>
          <MenuItem value={CALENDAR_VIEW.WEEK}>Week</MenuItem>
          <MenuItem value={CALENDAR_VIEW.MONTH}>Month</MenuItem>
          <MenuItem value={CALENDAR_VIEW.SCHEDULE}>Schedule</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}
