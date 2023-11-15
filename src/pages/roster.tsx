import * as React from 'react'

import Head from 'next/head'
import Header from '@/component/header'
import { Box, Container } from '@mui/material'
import Roster from '@/component/roster'

export default function RosterPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Roster</title>
        <meta name='description' content='american legion riders chapter 91 roster' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/images/alr-logo.png' />
      </Head>
      <Box component='main'>
        <Header />
        <Container maxWidth='xl' sx={{ p: 0.5 }}>
          <Roster />
        </Container>
      </Box>
    </React.Fragment>
  )
}
