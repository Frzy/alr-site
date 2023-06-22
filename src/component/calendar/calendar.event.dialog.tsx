import * as React from 'react'

import { Box, CircularProgress, Dialog, DialogProps, Slide } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import DefaultCalendarEventDialog from './event.dialog/default'

import type { TransitionProps } from '@mui/material/transitions'
import type { ICalendarEvent } from './calendar.timeline'
import EditCalendarEventDialog from './event.dialog/edit'
import { ENDPOINT } from '@/utils/constants'

export enum MODE {
  DEFAULT = 'default',
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

interface CalendarEventPros extends Omit<DialogProps, 'onClose'> {
  editable?: boolean
  event: ICalendarEvent
  onClose: () => void
}

export default function CalendarEventDialog({
  event,
  editable,
  onClose,
  ...dialogProps
}: CalendarEventPros) {
  const theme = useTheme()
  const [loading, setLoading] = React.useState(true)
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [mode, setMode] = React.useState(MODE.DEFAULT)
  const [recurrence, setRecurrence] = React.useState<string[]>([])

  function handleModeChange(newMode: MODE) {
    setMode(newMode)
  }
  function handleClose() {
    setMode(MODE.DEFAULT)
  }
  function handleEventChange(newEvent: ICalendarEvent) {
    if (onClose) onClose()
  }

  React.useEffect(() => {
    async function fetchReccurringEvent(id: String) {
      const response = await fetch(`${ENDPOINT.RECURRING_EVENT}/${id}`)

      const rEvent = await response.json()
      setRecurrence(rEvent.recurrence)
      setLoading(false)
    }

    if (event.recurringEventId) {
      setLoading(true)
      fetchReccurringEvent(event.recurringEventId)
    } else {
      setLoading(false)
    }
  }, [event])

  return (
    <Dialog
      TransitionComponent={Transition}
      onClose={onClose}
      {...dialogProps}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
    >
      {loading && (
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
      )}
      {!loading && mode === MODE.DEFAULT && (
        <DefaultCalendarEventDialog
          event={event}
          onClose={onClose}
          onModeChange={handleModeChange}
          recurrence={recurrence}
          editable
        />
      )}
      {!loading && mode === MODE.EDIT && (
        <EditCalendarEventDialog event={event} onClose={handleClose} recurrence={recurrence} />
      )}
    </Dialog>
  )
}
