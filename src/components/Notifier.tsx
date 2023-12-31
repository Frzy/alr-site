import * as React from 'react'
import { Alert, Slide, Snackbar, type SlideProps, type SnackbarProps } from '@mui/material'
import type { Notification } from '@/types/common'

function Transition(props: SlideProps): JSX.Element {
  return <Slide {...props} direction='up' />
}

export default function Notifier({
  autoHideDuration = 3000,
  open: initOpen,
  onClose,
  ...props
}: SnackbarProps): JSX.Element {
  const [notification, setNotification] = React.useState<Notification>()
  const [open, setOpen] = React.useState(false)

  function handleOnClose(): void {
    setOpen(false)
  }

  React.useEffect(() => {
    function handleNotificationEvent(event: CustomEvent<Notification>): void {
      setNotification(event.detail)
      setOpen(true)
    }

    addEventListener('notify', handleNotificationEvent as EventListener)

    return () => {
      removeEventListener('notify', handleNotificationEvent as EventListener)
    }
  }, [])

  return (
    <Snackbar
      open={open}
      onClose={handleOnClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      {...props}
      TransitionComponent={Transition}
      TransitionProps={{
        onExited: () => {
          setNotification(undefined)
        },
      }}
    >
      <Alert
        elevation={6}
        severity={notification?.severity}
        onClose={handleOnClose}
        variant='filled'
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  )
}
