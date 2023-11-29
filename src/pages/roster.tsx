import * as React from 'react'
import Head from 'next/head'
import Roster from '@/component/roster'

export default function RosterPage() {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Roster</title>
        <meta name='description' content='american legion riders chapter 91 roster' />
      </Head>

      <Roster />
    </React.Fragment>
  )
}
