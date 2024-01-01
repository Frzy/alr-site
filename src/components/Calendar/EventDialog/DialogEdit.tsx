import * as React from 'react'

import { createCalendarEvent, udpateCalendarEvent } from '@/utils/api'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import { EVENT_TYPE, EVENT_TYPES, EVENT_TYPE_COLOR, RECURRENCE_MODE } from '@/utils/constants'
import { LoadingButton } from '@mui/lab'
import { startCase } from '@/utils/helpers'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import CloseIcon from '@mui/icons-material/Close'
import CustomRecurrenceDialog from '../CustomRecurrenceDialog'
import EventRecurrenceConfirmationOptions from '../EventRecurrenceConfirmationOptions'
import MilesIcon from '@mui/icons-material/Route'
import NotesIcon from '@mui/icons-material/Notes'
import type { Dayjs } from 'dayjs'
import type { EventDialogView } from './Dialog'
import type { ICalendarEvent, RecurrenceOptions } from '@/types/common'
import {
  Box,
  Checkbox,
  DialogContent,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  type SelectChangeEvent,
  Typography,
  InputAdornment,
  DialogActions,
  Button,
} from '@mui/material'
import {
  combineDateAndTime,
  getCalendarEventTypeColor,
  getCalendarEventTypeIcon,
  getHumanReadableRecurrenceString,
} from '@/utils/calendar'

export default function DialogEdit({
  event: initEvent,
  onClose,
  onViewChange,
  onUpdate,
  onCreate,
}: {
  event: ICalendarEvent
  onClose: () => void
  onViewChange?: (view: EventDialogView) => void
  onUpdate?: (event: ICalendarEvent, options: RecurrenceOptions) => void
  onCreate?: (event: ICalendarEvent) => void
}): JSX.Element {
  const [event, setEvent] = React.useState({ ...initEvent })
  const [hasError, setHasError] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [showRecurrenceConfirmation, setShowRecurrenceConfirmation] = React.useState(false)
  const [repeatOption, setRepeatOption] = React.useState(
    event?.recurrence?.length ? event.recurrence[0] : '',
  )
  const [recurrenceMode, setRecurrenceMode] = React.useState<RECURRENCE_MODE>(
    RECURRENCE_MODE.SINGLE,
  )

  function handleEventTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target

    updateEvent({ [name]: value || undefined })
  }
  function handleEventTypeChange(event: SelectChangeEvent): void {
    const eventType = event.target.value as EVENT_TYPE
    let color: string

    switch (eventType) {
      case EVENT_TYPE.UNOFFICAL_RIDE:
      case EVENT_TYPE.RIDE:
        color = EVENT_TYPE_COLOR.RIDE
        break
      case EVENT_TYPE.MEETING:
        color = EVENT_TYPE_COLOR.MEETING
        break
      case EVENT_TYPE.EVENT:
        color = EVENT_TYPE_COLOR.EVENT
        break
      default:
        color = EVENT_TYPE_COLOR.OTHER
    }
    updateEvent({
      eventType,
      color,
    })
  }
  function handleMusterTimeChange(value: Dayjs | null): void {
    if (value) {
      const muster = combineDateAndTime(event.startDate, value)

      updateEvent({ muster })
    } else {
      updateEvent({ muster: undefined })
    }
  }
  function handleKsuTimeChange(value: Dayjs | null): void {
    if (value) {
      const ksu = combineDateAndTime(event.startDate, value)

      updateEvent({ ksu })
    } else {
      updateEvent({ ksu: undefined })
    }
  }
  function handleDateChange(data: Partial<ICalendarEvent>, error: boolean): void {
    setHasError(error)
    updateEvent(data)
  }

  function handleAllDayEventChange(changeEvent: React.ChangeEvent<HTMLInputElement>): void {
    const { checked: isAllDayEvent } = changeEvent.target
    let endDate = event.endDate

    if (
      (isAllDayEvent || event.isMultipleDayEvent) &&
      event.startDate.date() === event.endDate.date()
    ) {
      endDate = event.endDate.add(1, 'day')
    }

    updateEvent({ isAllDayEvent, endDate })
  }
  function handleMultiDayEventChange(changeEvent: React.ChangeEvent<HTMLInputElement>): void {
    const { checked: isMultipleDayEvent } = changeEvent.target

    updateEvent({ isMultipleDayEvent })
  }

  function handleRepeatSelectChange(event: SelectChangeEvent): void {
    const recurrence = event.target.value

    setRepeatOption(recurrence)
    if (recurrence !== 'custom') {
      updateEvent({ recurrence: recurrence ? [recurrence] : undefined })
    } else {
      if (onViewChange) onViewChange('edit_recurrence')
    }
  }
  function handleRecurrenceDialogClose(): void {
    setRepeatOption(event?.recurrence?.length ? event.recurrence[0] : '')

    if (onViewChange) onViewChange('edit')
  }
  function handleCustomRecurrenceChange(recurrence: string): void {
    setRepeatOption(recurrence)
    updateEvent({ recurrence: [recurrence] })
  }
  function handleRecurrenceModeChange(
    _event: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ): void {
    setRecurrenceMode(value as RECURRENCE_MODE)
  }

  function updateEvent(partialEvent: Partial<ICalendarEvent>): void {
    setEvent((prev) => ({ ...prev, ...partialEvent }))
  }

  function getDayOccurenceOfMonth(date: Dayjs): number {
    const dayOfMonth = date.date()

    return Math.floor((dayOfMonth - 1) / 7 + 1)
  }
  function getCommonRecurrenceOptions(): JSX.Element[] {
    const shortDay = event.startDate.format('dd').toUpperCase()
    const recStr = event.recurrence?.length ? event.recurrence[0] : ''
    const date = event.originalStartDate ?? event.startDate

    const dayOccurence = getDayOccurenceOfMonth(event.startDate)

    const rules = [
      'RRULE:FREQ=DAILY',
      `RRULE:FREQ=WEEKLY;BYDAY=${shortDay}`,
      `RRULE:FREQ=MONTHLY;BYDAY=${dayOccurence >= 4 ? -1 : dayOccurence}${shortDay}`,
      'RRULE:FREQ=YEARLY',
      'RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE',
    ]

    if (recStr && !rules.includes(recStr)) {
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

  function handleRecurrenceCheck(): void {
    if (event.recurrence) {
      setShowRecurrenceConfirmation(true)
    } else {
      void handleUpdateCalendarEvent()
    }
  }
  async function handleUpdateCalendarEvent(): Promise<void> {
    const options = { mode: recurrenceMode }
    setShowRecurrenceConfirmation(false)
    setLoading(true)

    if (event.isNew) {
      const response = await createCalendarEvent(event)

      if (response && onCreate) onCreate(response)
    } else {
      const response = await udpateCalendarEvent(event, options)

      if (response && onUpdate) onUpdate(response, options)
    }

    setLoading(false)
    if (onClose) onClose()
  }

  if (repeatOption === 'custom') {
    return (
      <CustomRecurrenceDialog
        defaultValue={event?.recurrence?.length ? event.recurrence[0] : undefined}
        onCancel={handleRecurrenceDialogClose}
        onChange={handleCustomRecurrenceChange}
      />
    )
  }

  if (showRecurrenceConfirmation) {
    return (
      <React.Fragment>
        <DialogContent>
          <EventRecurrenceConfirmationOptions
            value={recurrenceMode}
            onChange={handleRecurrenceModeChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ color: 'text.secondary' }}
            disabled={loading}
            onClick={() => {
              setShowRecurrenceConfirmation(false)
            }}
          >
            Cancel
          </Button>
          <LoadingButton loading={loading} color='primary' onClick={handleUpdateCalendarEvent}>
            Ok
          </LoadingButton>
        </DialogActions>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        {loading ? (
          <IconButton disabled sx={{ ml: 2 }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : (
          <Tooltip title='Close'>
            <IconButton sx={{ ml: 2 }} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <DialogContent sx={{ px: 2, pt: 0, minWidth: { xs: undefined, md: 400 } }}>
        <Stack spacing={1}>
          <TextField
            autoFocus
            disabled={loading}
            name='summary'
            onChange={handleEventTextChange}
            placeholder='Add Title'
            sx={{ '& .MuiInput-input ': { fontSize: '2rem', pl: 1 } }}
            value={event.summary ?? ''}
            variant='standard'
          />
          <FormControl variant='filled' size='small' disabled={loading} fullWidth>
            <Select
              labelId='event-type-select-label'
              id='event-type-select'
              displayEmpty
              value={event.eventType}
              onChange={handleEventTypeChange}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              {EVENT_TYPES.map((e) => (
                <MenuItem key={e} value={e}>
                  <Box display='flex' alignItems='center' gap={1}>
                    {getCalendarEventTypeIcon(e, {
                      sx: {
                        width: 20,
                        height: 20,
                        color: getCalendarEventTypeColor(e),
                      },
                    })}
                    {startCase(e)}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <EventDateSelector event={event} onChange={handleDateChange} />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControlLabel
              sx={{ minWidth: 100 }}
              control={
                <Checkbox
                  checked={event.isAllDayEvent}
                  disabled={loading}
                  onChange={handleAllDayEventChange}
                />
              }
              label='All Day Event'
            />
            <FormControlLabel
              sx={{ minWidth: 100 }}
              control={
                <Checkbox
                  checked={event.isMultipleDayEvent}
                  disabled={loading}
                  onChange={handleMultiDayEventChange}
                />
              }
              label='Multi-Day Event'
            />
          </Box>
          <FormControl variant='filled' size='small' disabled={loading}>
            <Select
              displayEmpty
              value={repeatOption}
              size='small'
              onChange={handleRepeatSelectChange}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >
              {getCommonRecurrenceOptions()}
            </Select>
          </FormControl>
          <Box>
            <TextField
              value={event.location ?? ''}
              name='location'
              variant='filled'
              size='small'
              disabled={loading}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
              fullWidth
              placeholder='Add Event Location'
              onChange={handleEventTextChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment sx={{ mt: '0 !important' }} position='start'>
                    <AddLocationIcon sx={{ color: loading ? 'text.disabled' : 'inherit' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {event.eventType === EVENT_TYPE.RIDE && (
            <React.Fragment>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
                <TextField
                  value={event.musterLocation ?? ''}
                  disabled={loading}
                  name='musterLocation'
                  variant='filled'
                  size='small'
                  sx={{ flexGrow: 1, '& .MuiInputBase-input': { py: 1 } }}
                  placeholder='Add Muster Location'
                  onChange={handleEventTextChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment sx={{ mt: '0 !important' }} position='start'>
                        <AddLocationIcon sx={{ color: loading ? 'text.disabled' : 'inherit' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography sx={{ color: loading ? 'text.disabled' : undefined }}>@</Typography>
                <TimePicker
                  value={event.muster ?? null}
                  disabled={loading}
                  sx={{ maxWidth: 135, '& .MuiInputBase-input': { py: 1 } }}
                  format='h:mm a'
                  timeSteps={{ minutes: 15 }}
                  slotProps={{
                    textField: { variant: 'filled', size: 'small', placeholder: 'Add Time' },
                  }}
                  onChange={handleMusterTimeChange}
                />
              </Box>
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <TextField
                  value={event.musterLocation ?? ''}
                  disabled={loading}
                  name='musterLocation'
                  variant='filled'
                  size='small'
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { py: 1 } }}
                  placeholder='Add Muster Location'
                  onChange={handleEventTextChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment sx={{ mt: '0 !important' }} position='start'>
                        <AddLocationIcon sx={{ color: loading ? 'text.disabled' : 'inherit' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TimePicker
                    value={event.muster ?? null}
                    disabled={loading}
                    sx={{ flexGrow: 1, '& .MuiInputBase-input': { py: 1 } }}
                    format='h:mm a'
                    timeSteps={{ minutes: 15 }}
                    slotProps={{
                      textField: {
                        variant: 'filled',
                        size: 'small',
                        placeholder: 'Muster Time',
                      },
                    }}
                    onChange={handleMusterTimeChange}
                  />
                  <TimePicker
                    value={event.ksu ?? null}
                    disabled={loading}
                    sx={{ flexGrow: 1, '& .MuiInputBase-input': { py: 1 } }}
                    format='h:mm a'
                    timeSteps={{ minutes: 15 }}
                    slotProps={{
                      clearButton: {
                        hidden: false,
                      },
                      textField: { variant: 'filled', size: 'small', placeholder: 'KSU Time' },
                    }}
                    onChange={handleKsuTimeChange}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ display: { xs: 'none', sm: 'inline-flex' }, flexGrow: 1 }}>
                  <TimePicker
                    value={event.ksu ?? null}
                    disabled={loading}
                    sx={{ '& .MuiInputBase-input': { py: 1 } }}
                    format='h:mm a'
                    timeSteps={{ minutes: 15 }}
                    slotProps={{
                      clearButton: {
                        hidden: false,
                      },
                      textField: {
                        variant: 'filled',
                        size: 'small',
                        placeholder: 'KSU Time',
                        fullWidth: true,
                      },
                    }}
                    onChange={handleKsuTimeChange}
                  />
                </Box>
                <TextField
                  value={event.miles ?? ''}
                  disabled={loading}
                  name='miles'
                  type='number'
                  variant='filled'
                  size='small'
                  sx={{ flexGrow: 1, '& .MuiInputBase-input': { py: 1 } }}
                  placeholder='Add Total Miles'
                  onChange={handleEventTextChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment sx={{ mt: '0 !important' }} position='start'>
                        <MilesIcon sx={{ color: loading ? 'text.disabled' : 'inherit' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        sx={{ mt: '0 !important', color: loading ? 'text.disabled' : 'inherit' }}
                        position='end'
                      >
                        {event.miles ? 'mi' : '  '}
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </React.Fragment>
          )}
          <TextField
            multiline
            minRows={3}
            maxRows={8}
            disabled={loading}
            name='description'
            value={event.description ?? ''}
            onChange={handleEventTextChange}
            placeholder='Add Description'
            sx={{ '& .MuiInputBase-root': { p: 1 } }}
            variant='filled'
            InputProps={{
              startAdornment: (
                <InputAdornment
                  sx={{
                    alignSelf: 'flex-start',
                    alignItems: 'flex-end',
                    height: '100%',
                    mt: '0 !important',
                  }}
                  position='start'
                >
                  <NotesIcon sx={{ color: loading ? 'text.disabled' : 'inherit' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={loading}
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            if (event.isNew && onClose) {
              onClose()
            } else if (onViewChange) {
              onViewChange('view')
            }
          }}
        >
          Cancel
        </Button>
        <LoadingButton onClick={handleRecurrenceCheck} loading={loading} disabled={hasError}>
          {event.isNew ? 'Create' : 'Save'}
        </LoadingButton>
      </DialogActions>
    </React.Fragment>
  )
}

function EventDateSelector({
  event,
  onChange,
  disabled,
}: {
  event: ICalendarEvent
  onChange?: (data: Partial<ICalendarEvent>, error: boolean) => void
  disabled?: boolean
}): JSX.Element {
  const [error, setError] = React.useState(false)
  const singleTime = !event.isAllDayEvent && !event.isMultipleDayEvent
  const multiDate = event.isAllDayEvent && event.isMultipleDayEvent
  const multiDateTime = !event.isAllDayEvent && event.isMultipleDayEvent

  function handleSingleDateChange(value: Dayjs | null): void {
    if (value) {
      const startDate = value
      const endDate = value.add(1, 'day').startOf('day')

      handleChange({ startDate, endDate })
    }
  }
  function handleAllDayStartDateChange(value: Dayjs | null): void {
    if (value) handleChange({ startDate: value.startOf('day') })
  }
  function handleAllDayEndDateChange(value: Dayjs | null): void {
    if (value) {
      handleChange({ endDate: value.add(1, 'day').startOf('day') })
    }
  }

  function handleSameDayDateChange(value: Dayjs | null): void {
    if (value) {
      const startDate = combineDateAndTime(value, event.startDate)
      const endDate = combineDateAndTime(value, event.endDate)

      handleChange({ startDate, endDate })
    }
  }
  function handleSameDayStartTimeChange(value: Dayjs | null): void {
    if (value && onChange) {
      const startDate = combineDateAndTime(event.startDate, value)

      handleChange({ startDate })
    }
  }
  function handleSameDayEndTimeChange(value: Dayjs | null): void {
    if (value) {
      const endDate = combineDateAndTime(event.endDate, value)

      handleChange({ endDate })
    }
  }

  function handleChange(data: Partial<ICalendarEvent>): void {
    const newEvent = { ...event, ...data }
    const newError = newEvent.endDate.isBefore(newEvent.startDate)

    setError(newError)
    if (onChange) onChange(data, newError)
  }

  if (singleTime) {
    return (
      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
        <DatePicker
          value={event.startDate}
          disabled={disabled}
          format='dddd, MMMM D'
          sx={{ '& .MuiInputBase-input': { py: 1 }, mr: 1 }}
          slotProps={{
            textField: {
              variant: 'filled',
              size: 'small',
              fullWidth: true,
              helperText: error ? 'End time is before start time.' : undefined,
            },
          }}
          onChange={handleSameDayDateChange}
        />
        <TimePicker
          value={event.startDate}
          disabled={disabled}
          format='h:mm a'
          maxTime={event.endDate.subtract(15, 'minutes')}
          sx={{ minWidth: 130, '& .MuiInputBase-input': { py: 1 } }}
          timeSteps={{ minutes: 15 }}
          slotProps={{ textField: { variant: 'filled', size: 'small' } }}
          onAccept={handleSameDayStartTimeChange}
        />
        <Typography sx={{ px: 1, color: disabled ? 'text.disabled' : undefined }}>
          {'\u2013'}
        </Typography>
        <TimePicker
          value={event.endDate}
          disabled={disabled}
          format='h:mm a'
          minTime={event.startDate.add(15, 'minutes')}
          sx={{
            minWidth: 130,
            '& .MuiInputBase-input': { py: 1 },
            '& .MuiInputBase-root': { bgcolor: error ? 'rgba(255, 0, 0, 0.1)' : undefined },
          }}
          timeSteps={{ minutes: 15 }}
          slotProps={{ textField: { variant: 'filled', size: 'small' } }}
          onAccept={handleSameDayEndTimeChange}
        />
      </Box>
    )
  }
  if (multiDateTime) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
          <Box sx={{ display: 'flex' }}>
            <DatePicker
              value={event.startDate}
              disabled={disabled}
              format='dddd, MMMM D'
              sx={{ '& .MuiInputBase-input': { py: 1 }, mr: 1 }}
              slotProps={{
                textField: { variant: 'filled', size: 'small', fullWidth: true },
              }}
              onChange={handleSameDayDateChange}
            />
            <TimePicker
              value={event.startDate}
              disabled={disabled}
              format='h:mm a'
              sx={{ maxWidth: 130, '& .MuiInputBase-input': { py: 1 } }}
              timeSteps={{ minutes: 15 }}
              slotProps={{ textField: { variant: 'filled', size: 'small' } }}
              onAccept={handleSameDayStartTimeChange}
            />
          </Box>
          <Box sx={{ display: 'flex' }}>
            <DatePicker
              value={event.endDate}
              disabled={disabled}
              format='dddd, MMMM D'
              sx={{
                mr: 1,
                '& .MuiInputBase-input': { py: 1 },
                '& .MuiInputBase-root': { bgcolor: error ? 'rgba(255, 0, 0, 0.1)' : undefined },
              }}
              slotProps={{
                textField: {
                  variant: 'filled',
                  size: 'small',
                  fullWidth: true,
                  error,
                  helperText: error ? 'End date is before start date.' : undefined,
                },
              }}
              onChange={handleSameDayDateChange}
            />
            <TimePicker
              value={event.endDate}
              disabled={disabled}
              format='h:mm a'
              sx={{
                maxWidth: 130,
                '& .MuiInputBase-input': { py: 1 },
                '& .MuiInputBase-root': { bgcolor: error ? 'rgba(255, 0, 0, 0.1)' : undefined },
              }}
              timeSteps={{ minutes: 15 }}
              slotProps={{ textField: { variant: 'filled', size: 'small', error } }}
              onAccept={handleSameDayStartTimeChange}
            />
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 19.5,
            right: 16,
            width: 14,
            height: 47,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        />
        <Typography sx={{ px: 1 }}>to</Typography>
      </Box>
    )
  }
  if (multiDate) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: { xs: 0, sm: 0.5 } }}>
        <DatePicker
          value={event.startDate}
          disabled={disabled}
          format='MMM D, YYYY'
          sx={{ flexGrow: 1, '& .MuiInputBase-input': { py: 1 } }}
          slotProps={{ textField: { variant: 'filled', size: 'small' } }}
          onChange={handleAllDayStartDateChange}
        />
        <Typography sx={{ px: 1, color: disabled ? 'text.disabled' : undefined }}>to</Typography>
        <DatePicker
          value={event.endDate.subtract(1, 'day')}
          disabled={disabled}
          format='MMM D, YYYY'
          sx={{
            flexGrow: 1,
            '& .MuiInputBase-root': { bgcolor: error ? 'rgba(255, 0, 0, 0.1)' : undefined },
            '& .MuiInputBase-input': { py: 1 },
          }}
          slotProps={{
            textField: {
              variant: 'filled',
              size: 'small',
              error,
              helperText: error ? 'End date is before start date.' : undefined,
            },
          }}
          onChange={handleAllDayEndDateChange}
        />
      </Box>
    )
  }
  return (
    <Box>
      <DatePicker
        value={event.startDate}
        disabled={disabled}
        format='MMM D, YYYY'
        sx={{ flexGrow: 1, '& .MuiInputBase-input': { py: 1 } }}
        slotProps={{ textField: { variant: 'filled', size: 'small', fullWidth: true } }}
        onChange={handleSingleDateChange}
      />
    </Box>
  )
}
