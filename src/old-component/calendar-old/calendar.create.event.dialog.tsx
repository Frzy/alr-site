import * as React from 'react'
import { Box, Dialog, DialogProps, DialogTitle, IconButton, Slide } from '@mui/material'
import { ICalendarEvent, IRequestBodyCalendarEvent, RecurrenceOptions } from '@/types/common'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import EditCalendarEventDialog from './event.dialog/edit'
import useMediaQuery from '@mui/material/useMediaQuery'

import type { TransitionProps } from '@mui/material/transitions'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface CalendarCreateEventProps extends Omit<DialogProps, 'onClose' | 'onChange'> {
  event: ICalendarEvent
  onChange?: (event: ICalendarEvent) => void
  onSave?: (
    event: ICalendarEvent,
    body: IRequestBodyCalendarEvent,
    recurrenceOptions?: RecurrenceOptions,
  ) => Promise<void> | void
  onClose?: () => void
  onComplete?: () => void
}

export default function CalendarCreateEventDialog({
  event,
  onChange,
  onComplete,
  onSave,
  onClose,
  ...dialogProps
}: CalendarCreateEventProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Dialog
      TransitionComponent={Transition}
      onClose={onClose}
      {...dialogProps}
      maxWidth='sm'
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ display: 'flex' }}>
        <Box flexGrow={1} />
        <IconButton
          size='small'
          onClick={() => {
            if (onClose) onClose()
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <EditCalendarEventDialog
        event={event}
        onChange={onChange}
        onCancel={onClose}
        onSave={onSave}
        onComplete={onComplete}
        createEvent
      />
    </Dialog>
  )
}
