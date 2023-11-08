import * as React from 'react'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { Alert, AlertTitle, Box, Container, Stack } from '@mui/material'
import { authOptions } from '@/lib/auth'
import { convertToPublicActivityLog, getActivityLogEntries } from '@/lib/activity.log'
import { ENDPOINT } from '@/utils/constants'
import { findMember } from '@/lib/roster'
import { getServerSession } from 'next-auth'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { useSession } from 'next-auth/react'
import ActivityLogViewer from '@/component/activity.log.viewer'
import Head from 'next/head'
import Header from '@/component/header'
import MemberInformation from '@/component/member.information'
import MemberYearlyRequirments from '@/component/member.yearly.requirments'
import moment from 'moment'

import type { ActivityLog, Member } from '@/types/common'
import type { GetServerSideProps } from 'next'

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
  const isCurrentlySignedIn = session.data?.user.id === member?.id
  const isOfficer = !!session.data?.user.office

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
      if (isCurrentlySignedIn) {
        await session.update(data)
      }
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
                {(isCurrentlySignedIn || isOfficer) && (
                  <MemberYearlyRequirments
                    logs={activityLogs}
                    year={moment().year()}
                    member={member}
                  />
                )}
                <ActivityLogViewer logs={activityLogs} isPublic={!isCurrentlySignedIn} />
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
