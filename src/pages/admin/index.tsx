import * as React from 'react'

import Head from 'next/head'
import Header from '@/component/header'
import { Box, Container, Paper, Card, LinearProgress } from '@mui/material'
import { useSession } from 'next-auth/react'

export default function AdminPage() {
  const { status, data } = useSession()
  const isAdmin = status === 'authenticated' && !!data.user.office

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Admin</title>
        <meta name='description' content='american legion riders chapter 91 admin section' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/images/alr-logo.png' />
      </Head>
      <Box component='main'>
        <Header />
        <Container maxWidth='xl' sx={{ p: 0.5 }}>
          <Paper sx={{ p: 2 }}>
            {status === 'loading' ? (
              <LinearProgress />
            ) : status === 'unauthenticated' ? (
              <h1>Not Authorized</h1>
            ) : (
              <h1>Admin Section</h1>
            )}
          </Paper>
        </Container>
      </Box>
    </React.Fragment>
  )
}
