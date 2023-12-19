import * as React from 'react'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogProps,
  DialogTitle,
  IconButton,
  Slide,
} from '@mui/material'
import { ENDPOINT } from '@/utils/constants'
import { getFrontEndCalendarEvent } from '@/utils/helpers'
import {
  ICalendarEvent,
  IRequestBodyCalendarEvent,
  IServerCalendarEvent,
  RecurrenceOptions,
} from '@/types/common'
import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import DefaultCalendarEventDialog from './event.dialog/default'
import DeleteCalendarEventDialog from './event.dialog/delete'
import DeleteIcon from '@mui/icons-material/Delete'
import EditCalendarEventDialog from './event.dialog/edit'
import EditIcon from '@mui/icons-material/Edit'
import useMediaQuery from '@mui/material/useMediaQuery'

import type { TransitionProps } from '@mui/material/transitions'

enum MODE {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface CalendarEventProps extends Omit<DialogProps, 'onClose'> {
  editable?: boolean
  event: ICalendarEvent | string
  onDelete?: (event: ICalendarEvent, recurrenceOptions?: RecurrenceOptions) => Promise<void> | void
  onEdit?: (
    event: ICalendarEvent,
    body: IRequestBodyCalendarEvent,
    recurrenceOptions?: RecurrenceOptions,
  ) => Promise<void> | void
  onClose?: () => void
}

export default function CalendarEventDialog({
  event: initEvent,
  editable,
  onDelete,
  onEdit,
  onClose,
  ...dialogProps
}: CalendarEventProps) {
  const theme = useTheme()
  const session = useSession()
  const isAdmin = !!session.data?.user.office
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [event, setEvent] = React.useState<ICalendarEvent>()
  const [mode, setMode] = React.useState(MODE.VIEW)
  const isRecurringEvent = !!event?.recurringEventId

  React.useEffect(() => {
    async function fetchCalendarEvent(id: string) {
      const response = await fetch(`${ENDPOINT.EVENT}/${id}`)
      const calEvent = (await response.json()) as IServerCalendarEvent

      if (calEvent.recurringEventId) {
        calEvent.recurrence = await fetchRecurrenceString(calEvent.recurringEventId)
      }

      setEvent(getFrontEndCalendarEvent(calEvent))
    }
    async function fetchRecurrenceEvent(event: ICalendarEvent) {
      event.recurrence = await fetchRecurrenceString(event.recurringEventId as string)

      setEvent(event)
    }
    async function fetchRecurrenceString(id: string) {
      const response = await fetch(`${ENDPOINT.EVENT}/${id}`)
      const recurEvent = (await response.json()) as IServerCalendarEvent

      return recurEvent.recurrence
    }

    if (typeof initEvent === 'string') {
      fetchCalendarEvent(initEvent)
    } else if (initEvent.recurringEventId) {
      fetchRecurrenceEvent(initEvent)
    } else {
      setEvent(initEvent)
    }
  }, [initEvent])

  return (
    <Dialog
      TransitionComponent={Transition}
      onClose={onClose}
      {...dialogProps}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
    >
      {mode === MODE.EDIT ? (
        <DialogTitle>Edit {isRecurringEvent ? 'Recurring Event' : 'Calendar Event'}</DialogTitle>
      ) : mode === MODE.DELETE ? (
        <DialogTitle>Delete {isRecurringEvent ? 'Recurring Event' : 'Calendar Event'}</DialogTitle>
      ) : (
        <DialogTitle sx={{ display: 'flex' }}>
          <Box flexGrow={1} />
          <Box>
            {editable && isAdmin && (
              <React.Fragment>
                <IconButton size='small' onClick={() => setMode(MODE.EDIT)}>
                  <EditIcon />
                </IconButton>
                <IconButton size='small' onClick={() => setMode(MODE.DELETE)}>
                  <DeleteIcon />
                </IconButton>
              </React.Fragment>
            )}
            <IconButton
              size='small'
              onClick={() => {
                if (onClose) onClose()
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}
      {!event ? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight={250}
          gap={3}
        >
          <Box>Fetching Event</Box>
          <CircularProgress />
        </Box>
      ) : mode === MODE.EDIT ? (
        <EditCalendarEventDialog
          event={event}
          onCancel={() => setMode(MODE.VIEW)}
          onSave={onEdit}
          onComplete={onClose}
        />
      ) : mode === MODE.DELETE ? (
        <DeleteCalendarEventDialog
          event={event}
          onCancel={() => setMode(MODE.VIEW)}
          onDelete={onDelete}
          onComplete={onClose}
        />
      ) : (
        <DefaultCalendarEventDialog event={event} />
      )}
    </Dialog>
  )
}
