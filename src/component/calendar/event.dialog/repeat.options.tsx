import * as React from 'react'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Radio,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { getRecurrenceStringParts } from '@/utils/helpers'
import DayPicker, { DAY } from '../calendar.day.picker'
import moment, { Moment, unitOfTime } from 'moment'

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
enum Ends {
  NEVER = 'never',
  UNTIL = 'until',
  COUNT = 'count',
}

const DEFAULT_COUNTS = {
  DAILY: 30,
  WEEKLY: 13,
  MONTHLY: 12,
  YEARLY: 5,
}
const DEFAULT_UNTIL = {
  DAILY: { value: 1, timeUnit: 'month' },
  WEEKLY: { value: 3, timeUnit: 'months' },
  MONTHLY: { value: 1, timeUnit: 'year' },
  YEARLY: { value: 5, timeUnit: 'years' },
}

type Recurrence = {
  freq: Frequency
  interval: number
  count?: number
  until: Moment | null
  byDay?: string
}

const BASE_STATE: Recurrence = {
  freq: 'WEEKLY',
  interval: 1,
  until: null,
}

function getBaseState(recStr?: string) {
  if (!recStr) return { ...BASE_STATE }

  const parts = getRecurrenceStringParts(recStr)
  const state = { ...BASE_STATE }

  for (let key in parts) {
    if (key === 'FREQ') state.freq = parts['FREQ'] as Frequency
    if (key === 'BYDAY') state.byDay = parts['BYDAY']
    if (key === 'COUNT') state.count = parseInt(parts['COUNT'] as string)
    if (key === 'INTERVAL') state.interval = parseInt(parts['INTERVAL'] as string)
    if (key === 'UNTIL') state.until = moment(parts['UNTIL'], 'YYYYMMDD')
  }

  return state
}

interface RecurrenceCalendarDialogProps {
  date: Moment
  defaultValue?: string
  onClose?: () => void
  onDone?: (recurrence: String) => void
}

export default function RecurrenceCalendarDialog({
  date,
  defaultValue,
  onClose,
  onDone,
}: RecurrenceCalendarDialogProps) {
  const [state, setState] = React.useState<Recurrence>(getBaseState(defaultValue))
  const [endValue, setEndValue] = React.useState<Ends>(
    state.count ? Ends.COUNT : !!state.until ? Ends.UNTIL : Ends.NEVER,
  )
  function handleIntervalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target
    let newValue = parseInt(value)

    if (!value) newValue = 1
    if (newValue > 0) setState((prev) => ({ ...prev, interval: newValue }))
  }
  function handleFreqChange(event: SelectChangeEvent) {
    const { value } = event.target

    setState((prev) => ({ ...prev, freq: value as Frequency, byDay: undefined }))
  }
  function handleEndValueChange(newValue: Ends) {
    switch (newValue) {
      case Ends.NEVER:
        setState((prev) => ({ ...prev, count: undefined, until: null }))
        break
      case Ends.COUNT:
        setState((prev) => ({ ...prev, count: DEFAULT_COUNTS[state.freq], until: null }))
        break
      case Ends.UNTIL:
        setState((prev) => ({
          ...prev,
          count: undefined,
          until: moment().add(
            DEFAULT_UNTIL[state.freq].value,
            DEFAULT_UNTIL[state.freq].timeUnit as unitOfTime.DurationConstructor,
          ),
        }))
        break
    }

    setEndValue(newValue)
  }
  function handleCountChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target
    let newValue = parseInt(value)

    if (!newValue) newValue = 1

    setState((prev) => ({ ...prev, count: newValue }))
  }
  function handleUntilChange(value: Moment | null) {
    console.log({ value: value?.format() })
    setState((prev) => ({ ...prev, until: value }))
  }
  function handleWeeklyByDayChange(value: DAY[]) {
    setState((prev) => ({ ...prev, byDay: value.join(',') }))
  }

  return (
    <React.Fragment>
      <DialogTitle sx={{ display: 'flex' }} component='div'>
        Recurrence Options
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Box display='flex' alignItems='center' gap={1}>
            <Typography fontWeight='fontWeightBold'>Repeat Every</Typography>
            <Tooltip title='Must be greater than 1'>
              <TextField
                type='number'
                value={state.interval}
                name='interval'
                size='small'
                sx={{ maxWidth: 75 }}
                onChange={handleIntervalChange}
              />
            </Tooltip>
            <Select
              value={state.freq}
              onChange={handleFreqChange}
              size='small'
              sx={{ minWidth: 110 }}
            >
              <MenuItem value='DAILY'>{state.interval > 1 ? 'days' : 'day'}</MenuItem>
              <MenuItem value='WEEKLY'>{state.interval > 1 ? 'weeks' : 'week'}</MenuItem>
              <MenuItem value='MONTHLY'>{state.interval > 1 ? 'months' : 'month'}</MenuItem>
              <MenuItem value='YEARLY'>{state.interval > 1 ? 'years' : 'year'}</MenuItem>
            </Select>
          </Box>
          {state.freq === 'WEEKLY' && (
            <Box>
              <Typography fontWeight='fontWeightBold'>Repeat On</Typography>
              <DayPicker
                days={state.byDay ? (state.byDay.split(',') as DAY[]) : []}
                onChange={handleWeeklyByDayChange}
              />
            </Box>
          )}
          <Box>
            <Typography fontWeight='fontWeightBold'>Ends</Typography>
            <Box display='flex' flexDirection='column' gap={1}>
              <Box
                display='flex'
                alignItems='center'
                sx={{ cursor: 'pointer' }}
                onClick={() => handleEndValueChange(Ends.NEVER)}
              >
                <Radio checked={endValue === Ends.NEVER} />
                <Typography sx={{ minWidth: 75 }}>Never</Typography>
              </Box>
              <Box display='flex' alignItems='center'>
                <Box
                  display='flex'
                  alignItems='center'
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleEndValueChange(Ends.UNTIL)}
                >
                  <Radio checked={endValue === Ends.UNTIL} />
                  <Typography sx={{ minWidth: 75 }}>On</Typography>
                </Box>
                <DatePicker
                  disabled={endValue !== Ends.UNTIL}
                  onChange={handleUntilChange}
                  minDate={moment().add(1, 'day')}
                  value={
                    endValue !== Ends.UNTIL
                      ? moment().add(
                          DEFAULT_UNTIL[state.freq].value,
                          DEFAULT_UNTIL[state.freq].timeUnit as unitOfTime.DurationConstructor,
                        )
                      : state.until
                  }
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 40,
                      width: 175,
                    },
                  }}
                />
              </Box>
              <Box display='flex' alignItems='center'>
                <Box
                  display='flex'
                  alignItems='center'
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleEndValueChange(Ends.COUNT)}
                >
                  <Radio checked={endValue === Ends.COUNT} />
                  <Typography sx={{ minWidth: 75 }}>After</Typography>
                </Box>
                <TextField
                  type='number'
                  size='small'
                  sx={{ width: 75 }}
                  disabled={endValue !== Ends.COUNT}
                  value={endValue !== Ends.COUNT ? DEFAULT_COUNTS[state.freq] : state.count}
                  onChange={handleCountChange}
                />
                <Typography
                  sx={{
                    pl: 1,
                    minWidth: 75,
                    color: endValue === Ends.COUNT ? undefined : 'text.disabled',
                  }}
                >
                  Ocurrences
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            if (onDone) onDone('test')
          }}
        >
          Done
        </Button>
      </DialogActions>
    </React.Fragment>
  )
}
