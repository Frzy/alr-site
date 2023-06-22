import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  FormControl,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import { EVENT_TYPE, EVENT_COLOR } from '@/utils/constants'
import { getHumanReadableRecurrenceString } from '@/utils/helpers'
import moment, { Moment } from 'moment'
import NotesIcon from '@mui/icons-material/Notes'
import PlaceIcon from '@mui/icons-material/Place'
import RecurrenceCalendarDialog from './repeat.options'

import type { ICalendarEvent } from '../calendar.timeline'

interface EditCalendarEventDialogProps {
  event: ICalendarEvent
  recurrence?: string[]
  onClose?: () => void
}

export default function EditCalendarEventDialog({
  event,
  recurrence = [],
  onClose,
}: EditCalendarEventDialogProps) {
  const [calendarEvent, setCalendarEvent] = React.useState<ICalendarEvent>({ ...event })
  const [repeatOption, setRepeatOption] = React.useState(recurrence.length ? recurrence[0] : '')
  const recurrenceString = React.useMemo(() => {
    if (recurrence.length && event.originalStartDate) {
      return getHumanReadableRecurrenceString(event.originalStartDate, recurrence[0])
    }

    return ''
  }, [event, recurrence])

  function handleEventTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setCalendarEvent((prev: ICalendarEvent) => ({ ...prev, [name]: value }))
  }
  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCalendarEvent((prev: ICalendarEvent) => ({ ...prev, isAllDayEvent: e.target.checked }))
  }
  function handleEventTypeChange(e: SelectChangeEvent) {
    setCalendarEvent((prev: ICalendarEvent) => ({
      ...prev,
      eventType: e.target.value as EVENT_TYPE,
    }))
  }
  function handleRepeatSelectChange(e: SelectChangeEvent) {
    setRepeatOption(e.target.value)
  }
  function handleStartDateChange(value: Moment | null) {
    if (value) {
      if (value.isAfter(calendarEvent.endDate)) {
        setCalendarEvent((prev: ICalendarEvent) => ({
          ...prev,
          startDate: value,
          endDate: moment(value).add(1, 'hour'),
        }))
      } else {
        setCalendarEvent((prev: ICalendarEvent) => ({ ...prev, startDate: value }))
      }
    }
  }
  function handleEndDateChange(value: Moment | null) {
    if (value) setCalendarEvent((prev: ICalendarEvent) => ({ ...prev, endDate: value }))
  }

  function getCommonRecurrenceOptions() {
    const shortDay = calendarEvent.startDate?.format('dd').toUpperCase()
    const recStr = recurrence.length ? recurrence[0] : ''
    const date = calendarEvent.originalStartDate || calendarEvent.startDate

    const rules = [
      'RRULE:FREQ=DAILY',
      `RRULE:FREQ=WEEKLY;BYDAY=${shortDay}`,
      `RRULE:FREQ=MONTHLY;BYDAY=1${shortDay}`,
      'RRULE:FREQ=YEARLY',
      'RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE',
    ]

    if (recStr && rules.indexOf(recStr) === -1) {
      rules.push(recStr)
    }

    return [
      <MenuItem key={1} value=''>
        Does not repeat
      </MenuItem>,
      ...rules.map((rule, index) => (
        <MenuItem key={index + 10} value={rule}>
          {getHumanReadableRecurrenceString(date, rule)}
        </MenuItem>
      )),
      <MenuItem key={7} value='custom'>
        Custom...
      </MenuItem>,
    ]
  }
  function handleRecurrenceDialogClose() {
    setRepeatOption(recurrence.length ? recurrence[0] : '')
  }

  if (repeatOption === 'custom') {
    return (
      <RecurrenceCalendarDialog
        date={event.originalStartDate || event.startDate}
        defaultValue={recurrence.length ? recurrence[0] : undefined}
        onClose={handleRecurrenceDialogClose}
      />
    )
  }

  return (
    <React.Fragment>
      <DialogTitle sx={{ display: 'flex' }} component='div'>
        <Box width='100%' display='flex' gap={2}></Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Box display='flex' alignItems='center' gap={1}>
            <Typography component='span' sx={{ minWidth: 45 }}>
              Title
            </Typography>
            <Box flexGrow={1}>
              <TextField
                variant='standard'
                value={calendarEvent.summary}
                onChange={handleEventTextChange}
                name='summary'
                placeholder='Add Title'
                fullWidth
                sx={{
                  flexGrow: 1,
                  '& .MuiInputBase-root': {
                    fontSize: {
                      xs: 'inherit',
                      sm: '28px',
                    },
                  },
                }}
              />
            </Box>
          </Box>
          <Box display='flex' alignItems='center' gap={1}>
            <Typography component='span' sx={{ minWidth: 45 }}>
              Type
            </Typography>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={calendarEvent.eventType}
                size='small'
                onChange={handleEventTypeChange}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.5,
                  },
                }}
              >
                <MenuItem disabled value=''>
                  <em>Add Event Type</em>
                </MenuItem>
                <MenuItem value={EVENT_TYPE.EVENT}>
                  <Box
                    component={'span'}
                    width={24}
                    height={24}
                    borderRadius={1}
                    bgcolor={EVENT_COLOR.event.main}
                    mr={2}
                  />
                  <ListItemText primary={EVENT_TYPE.EVENT.toUpperCase()} />
                </MenuItem>
                <MenuItem value={EVENT_TYPE.MEETING}>
                  <Box
                    component={'span'}
                    width={24}
                    height={24}
                    borderRadius={1}
                    bgcolor={EVENT_COLOR.meeting.main}
                    mr={2}
                  />
                  <ListItemText primary={EVENT_TYPE.MEETING.toUpperCase()} />
                </MenuItem>
                <MenuItem value={EVENT_TYPE.RIDE}>
                  <Box
                    component={'span'}
                    width={24}
                    height={24}
                    borderRadius={1}
                    bgcolor={EVENT_COLOR.ride.main}
                    mr={2}
                  />
                  <ListItemText primary={EVENT_TYPE.RIDE.toUpperCase()} />
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display='flex' alignItems='center' gap={1}>
            <Typography component='span' sx={{ minWidth: 45 }}>
              Starts
            </Typography>
            <Box flexGrow={1}>
              <DatePicker
                sx={{ '& .MuiInputBase-input': { py: 1 }, width: '100%' }}
                value={calendarEvent.startDate}
                onChange={handleStartDateChange}
              />
            </Box>
            {!calendarEvent.isAllDayEvent && (
              <Box sx={{ maxWidth: { xs: '100px', sm: '135px' } }}>
                <TimePicker
                  sx={{
                    '& .MuiInputBase-input': { py: 1 },
                  }}
                  minutesStep={15}
                  timeSteps={{ minutes: 15 }}
                  value={calendarEvent.startDate}
                  onChange={handleStartDateChange}
                />
              </Box>
            )}
          </Box>
          <Box display='flex' alignItems='center' gap={1}>
            <Typography component='span' sx={{ minWidth: 45 }}>
              Ends
            </Typography>
            <Box flexGrow={1}>
              <DatePicker
                sx={{ '& .MuiInputBase-input': { py: 1 }, width: '100%' }}
                value={calendarEvent.endDate}
                onChange={handleEndDateChange}
                minDate={calendarEvent.startDate}
              />
            </Box>
            {!calendarEvent.isAllDayEvent && (
              <Box sx={{ maxWidth: { xs: '100px', sm: '135px' } }}>
                <TimePicker
                  sx={{ '& .MuiInputBase-input': { py: 1 } }}
                  minutesStep={15}
                  timeSteps={{ minutes: 15 }}
                  value={calendarEvent.endDate}
                  onChange={handleEndDateChange}
                  minTime={calendarEvent.startDate}
                />
              </Box>
            )}
          </Box>
          <Box
            display='flex'
            gap={1}
            pl='55px'
            sx={{
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
            }}
          >
            <FormControlLabel
              control={
                <Checkbox checked={calendarEvent.isAllDayEvent} onChange={handleCheckboxChange} />
              }
              label='All Day Event'
            />
            <FormControl sx={{ flexGrow: 1 }}>
              <Select
                displayEmpty
                value={repeatOption}
                size='small'
                onChange={handleRepeatSelectChange}
              >
                {getCommonRecurrenceOptions()}
              </Select>
            </FormControl>
          </Box>
          {/* {repeatOption === '6' && <CustomRepeatOptions />} */}
          {calendarEvent.eventType === EVENT_TYPE.RIDE && (
            <React.Fragment>
              <Box display='flex' alignItems='center' gap={1}>
                <Typography component='span' sx={{ minWidth: 46 }}>
                  Muster
                </Typography>
                <TimePicker
                  sx={{ width: '100%', '& .MuiInputBase-input': { py: 1 } }}
                  minutesStep={15}
                  timeSteps={{ minutes: 15 }}
                  minTime={calendarEvent.startDate}
                  maxTime={calendarEvent.endDate}
                />
              </Box>
              <Box display='flex' alignItems='center' gap={1}>
                <Typography component='span' sx={{ minWidth: 46 }}>
                  KSU
                </Typography>
                <TimePicker
                  sx={{ width: '100%', '& .MuiInputBase-input': { py: 1 } }}
                  minutesStep={15}
                  timeSteps={{ minutes: 15 }}
                  minTime={calendarEvent.startDate}
                  maxTime={calendarEvent.endDate}
                />
              </Box>
            </React.Fragment>
          )}
          <Box display='flex' alignItems='center'>
            <PlaceIcon />
            <Box ml='30px' display='flex' alignItems='center' flexGrow={1}>
              <TextField
                name='location'
                placeholder='Add Location'
                fullWidth
                size='small'
                value={calendarEvent.location || ''}
                onChange={handleEventTextChange}
              />
            </Box>
          </Box>
          <Box display='flex'>
            <NotesIcon />
            <Box ml='30px' display='flex' alignItems='center' flexGrow={1}>
              <TextField multiline rows={3} fullWidth placeholder='Add Description' />
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Save</Button>
      </DialogActions>
    </React.Fragment>
  )
}
