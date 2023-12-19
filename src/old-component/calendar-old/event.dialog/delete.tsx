import * as React from 'react'
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useSession } from 'next-auth/react'
import moment, { Moment } from 'moment'
import type { ICalendarEvent, RecurrenceOptions } from '@/types/common'
import { RECURRENCE_MODE, ENDPOINT } from '@/utils/constants'
import CalendarEventRecurrenceForm from '../calendar.recurrence.form'

interface DefaultCalendarEventPros {
  event: ICalendarEvent
  onCancel?: () => void
  onDelete?: (event: ICalendarEvent, recurrenceOptions?: RecurrenceOptions) => Promise<void> | void
  onComplete?: () => void
}

export default function DeleteCalendarEventDialog({
  event,
  onCancel,
  onComplete,
  onDelete,
}: DefaultCalendarEventPros) {
  const session = useSession()
  const isAdmin = !!session.data?.user.office
  const [loading, setLoading] = React.useState(false)
  const [deleteMode, setDeleteMode] = React.useState(RECURRENCE_MODE.SINGLE)
  const isRecurringEvent = event.recurringEventId

  function handleDeleteModeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDeleteMode(event.target.value as RECURRENCE_MODE)
  }

  async function handleDeleteEvent() {
    let stopDate: Moment | undefined = undefined

    if (deleteMode === RECURRENCE_MODE.FUTURE) {
      stopDate = moment(event.startDate).subtract(1, 'day').endOf('day')
    }

    if (onDelete) {
      setLoading(true)
      await onDelete(event, { mode: deleteMode, stopDate })
      setLoading(false)
    }

    if (onComplete) onComplete()
  }

  return (
    <React.Fragment>
      <DialogContent>
        {isRecurringEvent ? (
          <CalendarEventRecurrenceForm value={deleteMode} onChange={handleDeleteModeChange} />
        ) : (
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to delete this calendar event ({event.summary}).
            </Typography>
            <Alert severity='warning'>This action can not be undone.</Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button color='inherit' disabled={loading} onClick={onCancel}>
          {isRecurringEvent ? 'Cancel' : 'No'}
        </Button>
        <LoadingButton loading={loading} color='error' onClick={handleDeleteEvent}>
          {isRecurringEvent ? 'Delete' : 'Yes'}
        </LoadingButton>
      </DialogActions>
    </React.Fragment>
  )
}
