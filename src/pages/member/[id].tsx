import * as React from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import Head from 'next/head'
import Header from '@/component/header'
import { Alert, AlertTitle, Box, Container, Stack, Typography } from '@mui/material'
import {
  convertToPublicActivityLog,
  getActivityLogEntries,
  udpateActivityLogName,
} from '@/lib/activity.log'
import ActivityLogViewer from '@/component/activity.log.viewer'
import { findMember } from '@/lib/roster'
import MemberInformation from '@/component/member.information'

import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

import type { ActivityLog, Member } from '@/types/common'
import type { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { ENDPOINT } from '@/utils/constants'

export const getServerSideProps: GetServerSideProps<MemberPageProps> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions)
  const { id } = query
  const member = await findMember((m) => m.id === id)
  let logs: ActivityLog[] = []

  if (member) {
    Object.keys(member).forEach(
      (key) => member[key as keyof Member] === undefined && delete member[key as keyof Member],
    )

    logs = await getActivityLogEntries((entry) => {
      const hasFirstName = entry.name.indexOf(member.firstName) !== -1
      const hasLastName = entry.name.indexOf(member.lastName) !== -1
      const hasSuffix = member.suffix ? entry.name.indexOf(` ${member.suffix}`) !== -1 : true

      return hasFirstName && hasLastName && hasSuffix
    })

    if (member.id !== session?.user.id) {
      logs = logs.map(convertToPublicActivityLog)
    }
  }

  return {
    props: { member: member || null, activityLogs: logs },
  }
}

interface MemberPageProps {
  member: Member | null
  activityLogs: ActivityLog[]
}

export default function MemberPage({ member: initMember, activityLogs }: MemberPageProps) {
  const session = useSession()
  const [member, setMember] = React.useState(initMember)

  function handleMemberChange(memberPart: Partial<Member>) {
    if (member) setMember({ ...member, ...memberPart })
  }
  async function handleUdpateMember(newMember: Member) {
    try {
      const response = await fetch(`${ENDPOINT.MEMBER}${newMember.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      })
      const data = await response.json()

      setMember(data)
    } catch (e) {
      console.log(e)
    }
  }

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
          <Container maxWidth='xl' sx={{ mt: 1, pb: 2 }}>
            {member ? (
              <Stack spacing={1}>
                <MemberInformation
                  member={member}
                  onSave={handleUdpateMember}
                  onChange={handleMemberChange}
                />
                <ActivityLogViewer
                  logs={activityLogs}
                  isPublic={session.data?.user.id !== member.id}
                />
              </Stack>
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
