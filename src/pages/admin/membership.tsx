import * as React from 'react'
import Head from 'next/head'
import Header from '@/component/header'
import { Container } from '@mui/material'

export default function AdminMembershipPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Admin Membership</title>
        <meta name='description' content='american legion riders chapter 91 admin membership' />
      </Head>
      <Header />
      <Container maxWidth='xl'>
        <h1>Admin Membership</h1>
      </Container>
    </React.Fragment>
  )
}
