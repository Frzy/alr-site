import * as React from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import Head from 'next/head'
import Header from '@/component/header'
import { Alert, AlertTitle, Box, Container, Typography } from '@mui/material'

import { findMember } from '@/lib/spreadsheet'
import MemberInformation from '@/component/member.information'

import type { Member } from '@/types/common'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps<MemberPageProps> = async ({
  req,
  res,
  query,
}) => {
  const { id } = query
  const member = await findMember((m) => m.id === id)
  let names: string[] = []

  if (member)
    Object.keys(member).forEach(
      (key) => member[key as keyof Member] === undefined && delete member[key as keyof Member],
    )

  return {
    props: { member: member || null },
  }
}

interface MemberPageProps {
  member: Member | null
}

export default function MemberPage({ member }: MemberPageProps) {
  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Member</title>
        <meta name='description' content='american legion riders chapter 91 member information' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box component='main'>
        <Header />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Container maxWidth='xl' sx={{ mt: 1 }}>
            {member ? (
              <React.Fragment>
                <Typography component='h1' variant='h3'>
                  Member Information
                </Typography>
                <MemberInformation member={member} />
              </React.Fragment>
            ) : (
              <Alert severity='error' sx={{ mt: 3 }}>
                <AlertTitle>Member Not Found</AlertTitle>
              </Alert>
            )}
          </Container>
        </LocalizationProvider>
      </Box>
    </React.Fragment>
  )
}
