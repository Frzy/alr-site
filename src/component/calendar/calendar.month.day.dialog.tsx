import * as React from 'react'

import { Chip, Dialog, DialogTitle, DialogContent, DialogProps, Stack } from '@mui/material'
import { ICalendarEvent } from './calendar.timeline'
import { Moment } from 'moment'

interface CalendarDayDialogProps extends DialogProps {
  day: Moment
  events: ICalendarEvent[]
}

export default function CalendarDayDialog({
  day,
  events = [],
  onClose,
  ...props
}: CalendarDayDialogProps) {
  return (
    <Dialog maxWidth='xs' fullWidth onClose={onClose} {...props}>
      <DialogTitle>{day.format('dddd MMM DD')}</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          {events.map((event, i) => (
            <Chip
              key={i}
              label={`${event.summary}${
                event.isAllDayEvent ? '' : event.startDate.format(' @ h:mma')
              }`}
              sx={{
                borderRadius: 2,
                justifyContent: 'flex-start',
              }}
            />
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
