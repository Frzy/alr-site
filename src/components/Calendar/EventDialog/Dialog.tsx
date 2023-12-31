import * as React from 'react'
import {
  Box,
  Dialog,
  useTheme,
  type DialogProps,
  useMediaQuery,
  CircularProgress,
} from '@mui/material'
import { mapServerToClient } from '@/utils/calendar'

import type { ICalendarEvent, IServerCalendarEvent, RecurrenceOptions } from '@/types/common'
import DialogView from './DialogView'
import DialogEdit from './DialogEdit'
import { deleteCalendarEvent } from '@/utils/api'
import { RECURRENCE_MODE } from '@/utils/constants'
import DialogDelete from './DialogDelete'

interface CalendarEventDialogProps extends DialogProps {
  event: ICalendarEvent | string
  onDelete?: (event: ICalendarEvent, options: RecurrenceOptions) => void
  onUpdate?: (event: ICalendarEvent, options: RecurrenceOptions) => void
  onCreate?: (event: ICalendarEvent) => void
  create?: boolean
}
export type EventDialogView =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'edit_recurrence'
  | 'edit_recurrence_confirmation'
  | 'activity_log'

export default function CalendarEventDialog({
  event: initEvent,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  ...other
}: CalendarEventDialogProps): JSX.Element | null {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [view, setView] = React.useState<EventDialogView>('view')
  const [event, setEvent] = React.useState<ICalendarEvent | null>(null)

  function handleClose(): void {
    if (onClose) onClose({}, 'backdropClick')
  }
  async function handleEventDelete(
    event: ICalendarEvent,
    options: RecurrenceOptions = { mode: RECURRENCE_MODE.SINGLE },
  ): Promise<void> {
    await deleteCalendarEvent(event, options)

    if (onDelete) onDelete(event, options)
  }

  React.useEffect(() => {
    async function fetchCalendarEvent(id: string): Promise<void> {
      const queryParams = new URLSearchParams({ expandRecurrence: 'true' })
      const response = await fetch(`/api/calendar/event/${id}?${queryParams.toString()}`)

      const calEvent = (await response.json()) as IServerCalendarEvent

      setEvent(mapServerToClient(calEvent))
    }

    if (typeof initEvent === 'string') {
      void fetchCalendarEvent(initEvent)
    } else if (!initEvent?._event?.recurrence && initEvent?._event?.recurringEventId) {
      void fetchCalendarEvent(initEvent.id)
    } else if (initEvent) {
      setEvent(initEvent)
    }
  }, [initEvent])

  return (
    <Dialog
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      fullScreen={event ? fullScreen : false}
      {...other}
      fullWidth={view === 'edit'}
      onClose={handleClose}
    >
      {!event ? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight={150}
          minWidth={250}
          gap={3}
        >
          <Box>Fetching Event</Box>
          <CircularProgress />
        </Box>
      ) : view === 'delete' ? (
        <DialogDelete
          event={event}
          onComplete={handleClose}
          onDelete={handleEventDelete}
          onCancel={() => {
            setView('view')
          }}
        />
      ) : view.includes('edit') || event.isNew ? (
        <DialogEdit
          event={event}
          onClose={handleClose}
          onUpdate={onUpdate}
          onCreate={onCreate}
          onViewChange={(newMode) => {
            setView(newMode)
          }}
        />
      ) : view === 'activity_log' ? (
        <div>Activity Log Entry</div>
      ) : (
        <DialogView
          event={event}
          onClose={handleClose}
          onViewChange={async (newView: EventDialogView) => {
            setView(newView)
          }}
        />
      )}
    </Dialog>
  )
}
