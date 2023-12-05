import * as React from 'react'
import Head from 'next/head'
import Roster from '@/component/roster'
import Header from '@/component/header'
import { Container } from '@mui/material'

export default function RosterPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Roster</title>
        <meta name='description' content='american legion riders chapter 91 roster' />
      </Head>
      <Header />
      <Container maxWidth='xl' sx={{ pb: 1 }}>
        <Roster />
      </Container>
    </React.Fragment>
  )
}
