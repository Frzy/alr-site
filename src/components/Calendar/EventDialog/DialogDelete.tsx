import * as React from 'react'
import { Alert, Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { RECURRENCE_MODE } from '@/utils/constants'
import EventRecurrenceConfirmationOptions from '../EventRecurrenceConfirmationOptions'
import type { ICalendarEvent, RecurrenceOptions } from '@/types/common'

interface DialogDeleteProps {
  event: ICalendarEvent
  onCancel?: () => void
  onDelete?: (event: ICalendarEvent, recurrenceOptions?: RecurrenceOptions) => Promise<void> | void
  onComplete?: () => void
}

export default function DialogDelete({
  event,
  onCancel,
  onComplete,
  onDelete,
}: DialogDeleteProps): JSX.Element {
  const [loading, setLoading] = React.useState(false)
  const [deleteMode, setDeleteMode] = React.useState(RECURRENCE_MODE.SINGLE)
  const isRecurringEvent = !!event._event?.recurringEventId

  function handleDeleteModeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setDeleteMode(event.target.value as RECURRENCE_MODE)
  }

  async function handleDeleteEvent(): Promise<void> {
    if (onDelete) {
      setLoading(true)
      await onDelete(event, { mode: deleteMode })
      setLoading(false)
    }

    if (onComplete) onComplete()
  }

  return (
    <React.Fragment>
      <DialogContent>
        {isRecurringEvent ? (
          <EventRecurrenceConfirmationOptions
            value={deleteMode}
            onChange={handleDeleteModeChange}
          />
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
