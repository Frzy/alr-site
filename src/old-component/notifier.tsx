import * as React from 'react'
import Alert, { AlertColor } from '@mui/material/Alert'
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar'
import Slide, { SlideProps } from '@mui/material/Slide'

type TransitionProps = Omit<SlideProps, 'direction'>

function Transition(props: TransitionProps) {
  return <Slide {...props} direction='up' />
}

type NotifierProps = {
  message: string
  severity: AlertColor
} & SnackbarProps

export default function Notifier({
  message,
  autoHideDuration = 3000,
  severity = 'success',
  onClose,
  ...snackBarProps
}: NotifierProps) {
  return (
    <Snackbar
      {...snackBarProps}
      onClose={onClose}
      TransitionComponent={Transition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={autoHideDuration}
    >
      <Alert
        severity={severity}
        onClose={
          onClose
            ? (event) => {
                if (onClose) onClose(event, 'timeout')
              }
            : undefined
        }
      >
        {message}
      </Alert>
    </Snackbar>
  )
}
