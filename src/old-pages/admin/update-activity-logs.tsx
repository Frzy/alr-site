import * as React from 'react'
import Head from 'next/head'
import Header from '@/component/header'
import {
  Alert,
  Box,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import CopyIcon from '@mui/icons-material/ContentCopy'
import { Member } from '@/types/common'
import useSWR, { Fetcher } from 'swr'
import { ACTIVE_ROLES, ENDPOINT, MAX_MAILTO, MEMBER_ROLES } from '@/utils/constants'
import SearchToolbar from '@/component/search.toolbar'
import Link from '@/component/link'

const ACTIVITY_LOG_GOOGLE_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSeRItJQh1bsLYeANzPIdgsMWGA2YPGgjfVZ_zLu5PW-TQXuzQ/viewform'

const fetcher: Fetcher<Member[], string> = async function fetcher(url) {
  const response = await fetch(url)
  const data = await response.json()

  return data
}

export default function AdminEmailListsPage() {
  const { status, data: session } = useSession()
  const isAdmin = !!session?.user.office && status === 'authenticated'

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Update Activity Logs</title>
        <meta
          name='description'
          content='american legion riders chapter 91 admin update activity logs'
        />
      </Head>
      <Header />
      <Container maxWidth='xl'>
        {status === 'loading' ? (
          <Paper sx={{ p: 2 }}>
            <LinearProgress />
          </Paper>
        ) : status === 'unauthenticated' || !isAdmin ? (
          <Paper sx={{ p: 1 }}>
            <Paper>
              <Alert severity='error'>Not Authorized</Alert>
            </Paper>
          </Paper>
        ) : (
          <UpdateActivityLogView />
        )}
      </Container>
    </React.Fragment>
  )
}

function UpdateActivityLogView() {
  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 1 }}>
        <Stack spacing={1}>
          <Typography>
            The purpose of this tool is to update the original activity log entry&apos;s name to an
            updated name that is provied by you. This might be needed if a user changes there name
            for whatever reason.
          </Typography>
          <Alert severity='info'>
            This does not modity the name on the{' '}
            <Link href={ACTIVITY_LOG_GOOGLE_FORM}>Activity Log Google Form</Link>. If that needs to
            be updated please contact the activity log administrator.
          </Alert>
        </Stack>
      </Paper>
      <Paper sx={{ p: 1 }}></Paper>
    </Stack>
  )
}
