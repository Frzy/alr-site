'use client'

import { Alert, AlertTitle, Typography } from '@mui/material'

export default function MemberNotFound(): JSX.Element {
  return (
    <Alert severity='error' sx={{ '& .MuiAlert-message': { flexGrow: 1 } }}>
      <AlertTitle>Resource Not Found</AlertTitle>
      <Typography>Sorry but the member was not found.</Typography>
    </Alert>
  )
}
