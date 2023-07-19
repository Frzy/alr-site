import * as React from 'react'
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
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
import {
  CALENDAR_COLOR,
  COLOR_OPTIONS,
  DEFAULT_CALENDAR_COLOR,
  DEFAULT_CALENDAR_COLOR_ID,
  EVENT_TYPE,
  EVENT_TYPES,
  EVENT_TYPE_COLOR,
  EVENT_TYPE_COLOR_ID,
  RECURRENCE_MODE,
  UPDATEABLE_PROPS,
} from '@/utils/constants'
import {
  capitalizeAllWords,
  getContrastTextColor,
  getHumanReadableRecurrenceString,
} from '@/utils/helpers'
import { LoadingButton } from '@mui/lab'
import CalendarColorPicker from '../calendar.color.picker'
import isEqual from 'react-fast-compare'
import CalendarEventRecurrenceForm from '../calendar.recurrence.form'
import moment, { Moment } from 'moment'
import NotesIcon from '@mui/icons-material/Notes'
import PlaceIcon from '@mui/icons-material/Place'
import RecurrenceCalendarDialog from './repeat.options'
import type { ICalendarEvent, IRequestBodyCalendarEvent, RecurrenceOptions } from '@/types/common'

interface EditCalendarEventDialogProps {
  event: ICalendarEvent
  createEvent?: boolean
  onChange?: (event: ICalendarEvent) => void
  onCancel?: () => void
  onComplete?: () => void
  onSave?: (
    event: ICalendarEvent,
    body: IRequestBodyCalendarEvent,
    recurrenceOptions?: RecurrenceOptions,
  ) => Promise<void> | void
}

export default function EditCalendarEventDialog({
  event: cEvent,
  createEvent,
  onCancel,
  onChange,
  onComplete,
  onSave,
}: EditCalendarEventDialogProps) {
  const [calendarEvent, setCalendarEvent] = React.useState<ICalendarEvent>({ ...cEvent })
  const [loading, setLoading] = React.useState(false)
  const [repeatOption, setRepeatOption] = React.useState(
    calendarEvent?.recurrence?.length ? calendarEvent.recurrence[0] : '',
  )
  const [showRecurrenceView, setShowRecurrenceView] = React.useState(false)
  const [recurMode, setRecurMode] = React.useState<RECURRENCE_MODE>()

  function handleEventTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    updateEvent({ [name]: value })
  }
  function handleAllDayEventChange(event: React.ChangeEvent<HTMLInputElement>) {
    const isAllDayEvent = event.target.checked

    if (isAllDayEvent) {
      updateEvent({
        isAllDayEvent,
        start: { date: calendarEvent.startDate.format('YYYY-MM-DD') },
        end: { date: moment(calendarEvent.endDate).add(1, 'day').format('YYYY-MM-DD') },
      })
    } else {
      updateEvent({
        isAllDayEvent,
        startDate: moment(calendarEvent.startDate).hour(10).minute(0).second(0),
        endDate: moment(calendarEvent.endDate).hour(11).minute(0).second(0),
        start: {
          dateTime: moment(calendarEvent.startDate).hour(10).minute(0).second(0).format(),
          timeZone: 'America/Phoenix',
        },
        end: {
          dateTime: moment(calendarEvent.endDate).hour(11).minute(0).second(0).format(),
          timeZone: 'America/Phoenix',
        },
      })
    }
  }
  function handleEventTypeChange(event: SelectChangeEvent) {
    const eventType = event.target.value as EVENT_TYPE
    let colorId: string
    let color: string

    switch (eventType) {
      case EVENT_TYPE.MEETING:
        colorId = EVENT_TYPE_COLOR_ID.MEETING
        color = EVENT_TYPE_COLOR.MEETING
        break
      case EVENT_TYPE.RIDE:
        colorId = EVENT_TYPE_COLOR_ID.RIDE
        color = EVENT_TYPE_COLOR.RIDE
        break
      case EVENT_TYPE.UNOFFICAL_RIDE:
        colorId = EVENT_TYPE_COLOR_ID.UNOFFICAL_RIDE
        color = EVENT_TYPE_COLOR.UNOFFICAL_RIDE
        break
      default:
        colorId = EVENT_TYPE_COLOR_ID.EVENT
        color = EVENT_TYPE_COLOR.EVENT
    }

    updateEvent({
      eventType,
      color,
      colorId,
    })
  }
  function handleRepeatSelectChange(event: SelectChangeEvent) {
    const recurrence = event.target.value
    setRepeatOption(recurrence)
    if (recurrence !== 'custom') updateEvent({ recurrence: recurrence ? [recurrence] : undefined })
  }
  function handleStartDateChange(value: Moment | null) {
    if (value) {
      const newState = updateStartDate(value, calendarEvent.endDate, calendarEvent.isAllDayEvent)
      updateEvent(newState)
    }
  }
  function handleEndDateChange(value: Moment | null) {
    if (value) {
      const newState = updateEndDate(value, calendarEvent.startDate, calendarEvent.isAllDayEvent)
      updateEvent(newState)
    }
  }
  function handleEventColorChange(event: SelectChangeEvent<unknown>) {
    let colorId = event.target.value as string
    let color: string
    const colorOpt = COLOR_OPTIONS.find((opt) => opt.value === colorId)

    if (!colorOpt) {
      colorId = DEFAULT_CALENDAR_COLOR_ID
      color = DEFAULT_CALENDAR_COLOR
    } else {
      color = colorOpt.color
    }

    updateEvent({
      colorId,
      color,
      textColor: getContrastTextColor(color),
    })
  }
  function handleCustomRecurrenceChange(recurrence: string) {
    setRepeatOption(recurrence)
    updateEvent({ recurrence: [recurrence] })
  }
  function handleRecurrenceDialogClose() {
    setRepeatOption(calendarEvent?.recurrence?.length ? calendarEvent.recurrence[0] : '')
  }
  function handleRecurrenceModeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRecurMode(event.target.value as RECURRENCE_MODE)
  }
  function handleMusterChange(value: Moment | null) {
    if (value) {
      const shared: { [key: string]: string } = {
        muster: value.format(),
      }

      updateEvent({
        muster: value,
        extendedProperties: {
          ...calendarEvent.extendedProperties,
          shared: {
            ...calendarEvent.extendedProperties?.shared,
            ...shared,
          },
        },
      })
    }
  }
  function handleKsuChange(value: Moment | null) {
    if (value) {
      const shared: { [key: string]: string } = {
        ksu: value.format(),
      }

      updateEvent({
        ksu: value,
        extendedProperties: {
          ...calendarEvent.extendedProperties,
          shared: {
            ...calendarEvent.extendedProperties?.shared,
            ...shared,
          },
        },
      })
    }
  }
  function handleCancelClick() {
    if (showRecurrenceView) {
      setShowRecurrenceView(false)
      setRecurMode(undefined)
    } else if (onCancel) {
      onCancel()
    }
  }
  function getCommonRecurrenceOptions() {
    const shortDay = calendarEvent.startDate?.format('dd').toUpperCase()
    const recStr = calendarEvent.recurrence?.length ? calendarEvent.recurrence[0] : ''
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
  function getEventOption(option: EVENT_TYPE) {
    let bgcolor

    switch (option) {
      case EVENT_TYPE.RIDE:
        bgcolor = EVENT_TYPE_COLOR.RIDE
        break
      case EVENT_TYPE.UNOFFICAL_RIDE:
        bgcolor = EVENT_TYPE_COLOR.UNOFFICAL_RIDE
        break
      case EVENT_TYPE.MEETING:
        bgcolor = EVENT_TYPE_COLOR.MEETING
        break
      default:
        bgcolor = 'transparent'
    }

    return (
      <Box display='flex' alignItems='center' gap={1}>
        {option !== EVENT_TYPE.EVENT && (
          <Box sx={{ width: 20, height: 20, bgcolor, borderRadius: 1 }} />
        )}
        {capitalizeAllWords(option)}
      </Box>
    )
  }
  function updateStartDate(date: Moment, endDate: Moment, isAllDay: boolean) {
    const isValid = date.isBefore(endDate)

    if (isAllDay && isValid) {
      const newEndDate = moment(date).endOf('day')

      return isValid
        ? {
            start: { date: date.format('YYYY-MM-DD') },
            startDate: date,
          }
        : {
            start: { date: date.format('YYYY-MM-DD') },
            startDate: date,
            end: { date: moment(newEndDate).add(1, 'day').format('YYYY-MM-DD') },
            endDate: newEndDate,
          }
    }

    if (!isValid) {
      const newEndDate = moment(date).add(1, 'hour')

      return {
        start: { dateTime: date.format(), timeZone: 'America/Phoenix' },
        startDate: date,
        end: { dateTime: newEndDate.format(), timeZone: 'America/Phoenix' },
        endDate: newEndDate,
      }
    }

    return {
      start: { dateTime: date.format(), timeZone: 'America/Phoenix' },
      startDate: date,
    }
  }
  function updateEndDate(date: Moment, startDate: Moment, isAllDay: boolean) {
    const isValid = date.isAfter(startDate)
    let newStartDate = isValid ? startDate : moment(date).subtract(1, 'hour')

    if (isAllDay) {
      newStartDate = moment(date).subtract(1, 'day').startOf('day')

      return isValid
        ? {
            end: { date: moment(date).add(1, 'day').format('YYYY-MM-DD') },
            endDate: date,
          }
        : {
            start: { date: newStartDate.format('YYYY-MM-DD') },
            startDate: newStartDate,
            end: { date: moment(date).add(1, 'day').format('YYYY-MM-DD') },
            endDate: date,
          }
    }

    if (!isValid) {
      const newStartDate = moment(date).subtract(1, 'hour')

      return {
        start: { dateTime: newStartDate.format(), timeZone: 'America/Phoenix' },
        startDate: newStartDate,
        end: { dateTime: date.format(), timeZone: 'America/Phoenix' },
        endDate: date,
      }
    }

    return {
      end: { dateTime: date.format(), timeZone: 'America/Phoenix' },
      endDate: date,
    }
  }

  function updateEvent(newValues: Partial<ICalendarEvent>) {
    const newState: ICalendarEvent = { ...calendarEvent, ...newValues }
    const changedEvent = { ...newState, isPastEvent: moment().isAfter(newState.endDate) }
    setCalendarEvent(changedEvent)
    if (onChange) onChange(changedEvent)
  }

  async function handleUpdateEvent() {
    const calendarCopy = { ...calendarEvent }
    if (cEvent.recurringEventId && !recurMode) {
      setShowRecurrenceView(true)
      if (cEvent.recurrence !== calendarCopy.recurrence) {
        setRecurMode(RECURRENCE_MODE.FUTURE)
      } else {
        setRecurMode(RECURRENCE_MODE.SINGLE)
      }
    } else {
      const recurrenceOptions: RecurrenceOptions = {
        mode: recurMode || RECURRENCE_MODE.SINGLE,
      }

      if (recurMode === RECURRENCE_MODE.FUTURE) {
        recurrenceOptions.stopDate = moment(calendarCopy.startDate).subtract(1, 'day').endOf('day')
      }

      if (calendarCopy.eventType === EVENT_TYPE.RIDE) {
        if (calendarCopy.muster && !calendarCopy.extendedProperties?.shared?.muster) {
          calendarCopy.extendedProperties = {
            ...calendarCopy.extendedProperties,
            shared: {
              ...calendarCopy.extendedProperties?.shared,
              muster: calendarCopy.muster?.format(),
            },
          }
        }
        if (calendarCopy.ksu && !calendarCopy.extendedProperties?.shared?.ksu) {
          calendarCopy.extendedProperties = {
            ...calendarCopy.extendedProperties,
            shared: {
              ...calendarCopy.extendedProperties?.shared,
              ksu: calendarCopy.ksu?.format(),
            },
          }
        }
      }

      setLoading(true)
      if (onSave) await onSave(calendarCopy, getDirtyProps(calendarCopy), recurrenceOptions)
      setLoading(false)

      setRecurMode(undefined)

      if (onComplete) onComplete()
    }
  }
  function getDirtyProps(toCheck: ICalendarEvent) {
    const dirtyProps: IRequestBodyCalendarEvent = {}

    UPDATEABLE_PROPS.forEach((prop) => {
      if (createEvent) {
        dirtyProps[prop] = toCheck[prop]
      } else if (!isEqual(cEvent[prop], toCheck[prop])) {
        dirtyProps[prop] = toCheck[prop]
      }
    })

    return dirtyProps
  }

  if (repeatOption === 'custom') {
    return (
      <RecurrenceCalendarDialog
        date={calendarEvent.originalStartDate || calendarEvent.startDate}
        defaultValue={calendarEvent?.recurrence?.length ? calendarEvent.recurrence[0] : undefined}
        onCancel={handleRecurrenceDialogClose}
        onChange={handleCustomRecurrenceChange}
      />
    )
  }

  return (
    <React.Fragment>
      <DialogContent>
        {showRecurrenceView ? (
          <CalendarEventRecurrenceForm
            value={recurMode}
            onChange={handleRecurrenceModeChange}
            noSingle={cEvent.recurrence !== calendarEvent.recurrence}
          />
        ) : (
          <Stack spacing={1}>
            <Box display='flex' alignItems='center' gap={1}>
              <Typography component='span' sx={{ minWidth: 45 }}>
                Title
              </Typography>
              <Box flexGrow={1}>
                <TextField
                  variant='standard'
                  value={calendarEvent.summary ? calendarEvent.summary : ''}
                  onChange={handleEventTextChange}
                  name='summary'
                  placeholder='Add Title'
                  autoComplete='off'
                  fullWidth
                  autoFocus
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
                  onChange={handleEventTypeChange}
                  size='small'
                >
                  <MenuItem disabled value=''>
                    <em>Add Event Type</em>
                  </MenuItem>
                  {EVENT_TYPES.map((e) => (
                    <MenuItem key={e} value={e}>
                      {getEventOption(e)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {calendarEvent.eventType === EVENT_TYPE.EVENT && (
                <CalendarColorPicker
                  value={calendarEvent.colorId}
                  onChange={handleEventColorChange}
                />
              )}
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
                  <Checkbox
                    checked={calendarEvent.isAllDayEvent}
                    onChange={handleAllDayEventChange}
                  />
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
                    minutesStep={5}
                    timeSteps={{ minutes: 5 }}
                    minTime={calendarEvent.startDate}
                    value={calendarEvent.muster}
                    onChange={handleMusterChange}
                  />
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  <Typography component='span' sx={{ minWidth: 46 }}>
                    KSU
                  </Typography>
                  <TimePicker
                    sx={{ width: '100%', '& .MuiInputBase-input': { py: 1 } }}
                    minutesStep={5}
                    timeSteps={{ minutes: 5 }}
                    minTime={moment(calendarEvent.startDate)}
                    value={calendarEvent.ksu}
                    onChange={handleKsuChange}
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
        )}
      </DialogContent>
      <DialogActions>
        {!showRecurrenceView && (
          <Button color='inherit' onClick={() => updateEvent(cEvent)}>
            Reset
          </Button>
        )}
        <Box flexGrow={1} />
        <Button color='inherit' onClick={handleCancelClick}>
          Cancel
        </Button>
        <LoadingButton onClick={handleUpdateEvent} loading={loading}>
          Save
        </LoadingButton>
      </DialogActions>
    </React.Fragment>
  )
}
