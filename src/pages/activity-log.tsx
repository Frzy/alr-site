import * as React from 'react'
import { Alert, Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import Header from '@/component/header'
import Head from 'next/head'

export default function ActivityLogForm() {
  const session = useSession()

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Activity Log</title>
        <meta name='description' content='american legion riders chapter 91 activity log' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box component='main'>
        <Header />
        <Container maxWidth='xl' sx={{ p: 0.5 }}>
          <Paper sx={{ p: 1 }}>
            <Stack spacing={2}>
              <Typography variant='h3'>Activity Log</Typography>

              <Alert severity='info' action={<Button color='inherit'>Login</Button>}>Log in to take advantage of the new features of the activity log.</Alert>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </React.Fragment>
  )
}