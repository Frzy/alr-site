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

import PlaceIcon from '@mui/icons-material/Place'
import NotesIcon from '@mui/icons-material/Notes'

import type { ICalendarEvent } from './calendar.timeline'
import moment, { Moment } from 'moment'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import { EVENT_COLOR, EVENT_TYPE } from '@/utils/constants'
import CustomRepeatOptions from './event.dialog/repeat.options'

interface CalendarEventPros extends Omit<DialogProps, 'onClose'> {
  event?: ICalendarEvent
  onClose: () => void
}

export default function CalendarEditEventDialog({
  event: cEvent,
  onClose,
  ...dialogProps
}: CalendarEventPros) {
  const [calendarEvent, setCalendarEvent] = React.useState({ ...cEvent })
  const [repeatOption, setRepeatOption] = React.useState('6')

  function handleEventTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setCalendarEvent((prev) => ({ ...prev, [name]: value }))
  }
  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCalendarEvent((prev) => ({ ...prev, isAllDayEvent: event.target.checked }))
  }
  function handleEventTypeChange(event: SelectChangeEvent) {
    setCalendarEvent((prev) => ({ ...prev, eventType: event.target.value as EVENT_TYPE }))
  }
  function handleRepeatSelectChange(event: SelectChangeEvent) {
    setRepeatOption(event.target.value)
  }
  function handleStartDateChange(value: Moment | null) {
    if (value) {
      if (value.isAfter(calendarEvent.endDate)) {
        setCalendarEvent((prev) => ({
          ...prev,
          startDate: value,
          endDate: moment(value).add(1, 'hour'),
        }))
      } else {
        setCalendarEvent((prev) => ({ ...prev, startDate: value }))
      }
    }
  }
  function handleEndDateChange(value: Moment | null) {
    if (value) setCalendarEvent((prev) => ({ ...prev, endDate: value }))
  }

  if (!cEvent) return null

  return (
    <Dialog onClose={onClose} {...dialogProps}>
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
            <FormControl>
              <Select
                displayEmpty
                value={repeatOption}
                size='small'
                onChange={handleRepeatSelectChange}
              >
                <MenuItem value=''>Does not repeat</MenuItem>
                <MenuItem value='1'>Daily</MenuItem>
                <MenuItem value='2'>{`Weekly on ${calendarEvent.startDate?.format(
                  'dddd',
                )}`}</MenuItem>
                <MenuItem value='3'>{`Monthly on the first ${calendarEvent.startDate?.format(
                  'dddd',
                )}`}</MenuItem>
                <MenuItem value='4'>{`Annually on ${calendarEvent.startDate?.format(
                  'MMMM D',
                )}`}</MenuItem>
                <MenuItem value='5'>Every Weekday</MenuItem>
                <MenuItem value='6'>Custom...</MenuItem>
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
        <Button>Cancel</Button>
        <Button>Save</Button>
      </DialogActions>
    </Dialog>
  )
}
