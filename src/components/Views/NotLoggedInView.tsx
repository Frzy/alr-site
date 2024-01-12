'use client'

import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material'
import { signIn } from 'next-auth/react'
import BaseLayout from '../BaseLayout'

export default function NotLoggedInView(): JSX.Element {
  return (
    <BaseLayout>
      <Alert severity='error' sx={{ '& .MuiAlert-message': { flexGrow: 1 } }}>
        <AlertTitle>Authentication Error</AlertTitle>
        <Stack spacing={1}>
          <Typography>
            You must be logged in to view this page. To login please click the button below.
          </Typography>
          <Button
            onClick={() => {
              void signIn()
            }}
          >
            Login
          </Button>
        </Stack>
      </Alert>
    </BaseLayout>
  )
}
