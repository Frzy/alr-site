import * as React from 'react'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  MenuItem,
  Radio,
  Select,
  Stack,
  TextField,
  Tooltip,
  type SelectChangeEvent,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import DayPicker, { type DAY } from './DayPicker'
import type { Recurrence } from '@/types/common'
import { getRecurrenceStringFromParts, getRecurrenceStringParts } from '@/utils/calendar'
import dayjs, { type ManipulateType, type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
interface CustomRecurrence {
  freq: Frequency
  interval: number
  count?: number
  until: Dayjs | null
  byDay?: string
}
interface UntilRecord {
  value: number
  timeUnit: ManipulateType
}
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
const DEFAULT_UNTIL: Record<Frequency, UntilRecord> = {
  DAILY: { value: 1, timeUnit: 'month' },
  WEEKLY: { value: 3, timeUnit: 'months' },
  MONTHLY: { value: 1, timeUnit: 'year' },
  YEARLY: { value: 5, timeUnit: 'years' },
}

const BASE_STATE: CustomRecurrence = {
  freq: 'WEEKLY',
  interval: 1,
  until: null,
}

function getBaseState(recStr?: string): CustomRecurrence {
  if (!recStr) return { ...BASE_STATE }

  const parts = getRecurrenceStringParts(recStr)
  const state = { ...BASE_STATE }

  for (const key in parts) {
    if (key === 'FREQ') state.freq = parts.FREQ ?? 'DAILY'
    if (key === 'BYDAY') state.byDay = parts.BYDAY
    if (key === 'COUNT') state.count = parseInt(parts.COUNT ?? '0')
    if (key === 'INTERVAL') state.interval = parseInt(parts.INTERVAL ?? '1')
    if (key === 'UNTIL') state.until = dayjs(parts.UNTIL, 'YYYYMMDD')
  }

  return state
}
function convertRecurrenceObject(parts: CustomRecurrence): Recurrence {
  const newParts: Recurrence = {}

  for (const key in parts) {
    if (key === 'freq') newParts.FREQ = parts.freq as Frequency
    if (key === 'byDay') newParts.BYDAY = parts.byDay ? parts.byDay : undefined
    if (key === 'count') newParts.COUNT = parts.count ? `${parts.count}` : undefined
    if (key === 'interval') newParts.INTERVAL = parts.interval ? `${parts.interval}` : undefined
    if (key === 'until') newParts.UNTIL = parts.until ? parts.until.format('YYYYMMDD') : undefined
  }

  return newParts
}

interface RecurrenceCalendarDialogProps {
  defaultValue?: string
  onCancel?: () => void
  onChange?: (recurrence: string) => void
}

export default function CustomRecurrenceDialog({
  defaultValue,
  onCancel,
  onChange,
}: RecurrenceCalendarDialogProps): JSX.Element {
  const [state, setState] = React.useState<CustomRecurrence>(getBaseState(defaultValue))
  const [endValue, setEndValue] = React.useState<Ends>(
    state.count ? Ends.COUNT : state.until ? Ends.UNTIL : Ends.NEVER,
  )
  function handleIntervalChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target
    let newValue = parseInt(value)

    if (!value) newValue = 1
    if (newValue > 0) setState((prev) => ({ ...prev, interval: newValue }))
  }
  function handleFreqChange(event: SelectChangeEvent): void {
    const { value } = event.target

    setState((prev) => ({ ...prev, freq: value as Frequency, byDay: undefined }))
  }
  function handleEndValueChange(newValue: Ends): void {
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
          until: dayjs().add(DEFAULT_UNTIL[state.freq].value, DEFAULT_UNTIL[state.freq].timeUnit),
        }))
        break
    }

    setEndValue(newValue)
  }
  function handleCountChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target
    let newValue = parseInt(value)

    if (!newValue) newValue = 1

    setState((prev) => ({ ...prev, count: newValue }))
  }
  function handleUntilChange(value: Dayjs | null): void {
    setState((prev) => ({ ...prev, until: value }))
  }
  function handleWeeklyByDayChange(value: DAY[]): void {
    setState((prev) => ({ ...prev, byDay: value.join(',') }))
  }

  return (
    <React.Fragment>
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
                onClick={() => {
                  handleEndValueChange(Ends.NEVER)
                }}
              >
                <Radio checked={endValue === Ends.NEVER} />
                <Typography sx={{ minWidth: 75 }}>Never</Typography>
              </Box>
              <Box display='flex' alignItems='center'>
                <Box
                  display='flex'
                  alignItems='center'
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleEndValueChange(Ends.UNTIL)
                  }}
                >
                  <Radio checked={endValue === Ends.UNTIL} />
                  <Typography sx={{ minWidth: 75 }}>On</Typography>
                </Box>
                <DatePicker
                  disabled={endValue !== Ends.UNTIL}
                  onChange={handleUntilChange}
                  minDate={dayjs().add(1, 'day')}
                  value={
                    endValue !== Ends.UNTIL
                      ? dayjs().add(
                          DEFAULT_UNTIL[state.freq].value,
                          DEFAULT_UNTIL[state.freq].timeUnit,
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
                  onClick={() => {
                    handleEndValueChange(Ends.COUNT)
                  }}
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
        <Button color='inherit' onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (onChange) onChange(getRecurrenceStringFromParts(convertRecurrenceObject(state)))
          }}
        >
          Done
        </Button>
      </DialogActions>
    </React.Fragment>
  )
}
