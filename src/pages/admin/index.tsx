import * as React from 'react'

import Head from 'next/head'
import Header from '@/component/header'
import { Box, Container, Paper, Card } from '@mui/material'

export default function AdminPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Admin</title>
        <meta name='description' content='american legion riders chapter 91 admin section' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box component='main'>
        <Header />
        <Container maxWidth='xl' sx={{ p: 0.5 }}>
          <h1>Admin Section</h1>
        </Container>
      </Box>
    </React.Fragment>
  )
}
