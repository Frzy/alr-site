import * as React from 'react'
import Head from 'next/head'
import Header from '@/component/header'
import { Container } from '@mui/material'

export default function AdminEmailListsPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Admin Email Lists</title>
        <meta name='description' content='american legion riders chapter 91 admin email lists' />
      </Head>
      <Header />
      <Container maxWidth='xl'>
        <h1>Admin Email Lists</h1>
      </Container>
    </React.Fragment>
  )
}
