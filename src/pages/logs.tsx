import * as React from 'react'

import Head from 'next/head'
import Header from '@/component/header'
import { Box, Container } from '@mui/material'

export default function RosterPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Logs</title>
        <meta name='description' content='american legion riders chapter 91 activity logs' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box component='main'>
        <Header />
        <Container maxWidth='xl' sx={{ p: 0.5 }}>
          <h1>Logs</h1>
        </Container>
      </Box>
    </React.Fragment>
  )
}
