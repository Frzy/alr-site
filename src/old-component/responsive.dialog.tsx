import * as React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
type ResponsiveDialog = {
  title?: string
  hideTitleBar?: boolean
  onClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'titleCloseClick') => void
  actions?: React.ReactNode
} & Omit<DialogProps, 'onClose'>

export default function ResponsiveDialog({
  children,
  hideTitleBar,
  onClose,
  title,
  actions,
  ...other
}: ResponsiveDialog) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  function handleClose(event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'titleCloseClick') {
    if (onClose) onClose(event, reason)
  }

  return (
    <Dialog onClose={handleClose} {...other} fullScreen={fullScreen}>
      {!hideTitleBar && (
        <React.Fragment>
          <DialogTitle sx={{ pr: 8 }}>{!!title ? title : ''}</DialogTitle>
          <IconButton
            aria-label='close'
            onClick={() => handleClose({}, 'titleCloseClick')}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Divider />
        </React.Fragment>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
