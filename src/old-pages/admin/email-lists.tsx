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
        <title>ALR 91 - Admin Email Lists</title>
        <meta name='description' content='american legion riders chapter 91 admin email lists' />
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
          <EmailListView />
        )}
      </Container>
    </React.Fragment>
  )
}

function EmailListView() {
  const { data, isLoading } = useSWR(ENDPOINT.ROSTER, fetcher, { fallbackData: [] })
  const officers = React.useMemo(() => {
    return data.filter((m) => !!m.office)
  }, [data])
  const memebrs = React.useMemo(() => {
    return data.filter((m) => MEMBER_ROLES.indexOf(m.role) !== -1)
  }, [data])
  const activeMember = React.useMemo(() => {
    return data.filter((m) => ACTIVE_ROLES.indexOf(m.role) !== -1)
  }, [data])
  const officersEmails = React.useMemo(() => {
    return officers.filter((m) => m.email).map((m) => `${m.name} <${m.email}>`)
  }, [officers])
  const memebrsEmails = React.useMemo(() => {
    return memebrs.filter((m) => m.email).map((m) => `${m.name} <${m.email}>`)
  }, [memebrs])
  const activeMemberEmails = React.useMemo(() => {
    return activeMember.filter((m) => m.email).map((m) => `${m.name} <${m.email}>`)
  }, [activeMember])
  const officersEmailsShort = React.useMemo(() => {
    return officers.filter((m) => m.email).map((m) => m.email)
  }, [officers])
  const memebrsEmailsShort = React.useMemo(() => {
    return memebrs.filter((m) => m.email).map((m) => m.email)
  }, [memebrs])
  const activeMemberEmailsShort = React.useMemo(() => {
    return activeMember.filter((m) => m.email).map((m) => m.email)
  }, [activeMember])

  const [officeEl, setOfficeEl] = React.useState<HTMLButtonElement | null>(null)
  const [memberEl, setMemberEl] = React.useState<HTMLButtonElement | null>(null)
  const [activeEl, setActiveEl] = React.useState<HTMLButtonElement | null>(null)
  const officeOpen = Boolean(officeEl)
  const memberOpen = Boolean(memberEl)
  const activeOpen = Boolean(activeEl)

  async function handleCopyOfficers(event: React.MouseEvent<HTMLButtonElement>) {
    setOfficeEl(event.currentTarget)

    await navigator.clipboard.writeText(officersEmails.join(',\n'))

    setTimeout(() => {
      setOfficeEl(null)
    }, 1000)
  }
  async function handleCopyMembers(event: React.MouseEvent<HTMLButtonElement>) {
    setMemberEl(event.currentTarget)

    await navigator.clipboard.writeText(memebrsEmails.join(',\n'))

    setTimeout(() => {
      setMemberEl(null)
    }, 1000)
  }
  async function handleCopyActiveMembers(event: React.MouseEvent<HTMLButtonElement>) {
    setActiveEl(event.currentTarget)

    await navigator.clipboard.writeText(activeMemberEmails.join(',\n'))

    setTimeout(() => {
      setActiveEl(null)
    }, 1000)
  }

  return (
    <React.Fragment>
      <SearchToolbar title={`Email Lists`} hideSearch sx={{ mb: 1, borderRadius: 1 }} />
      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <LinearProgress />
        </Paper>
      ) : (
        <Grid spacing={2} container>
          <Grid xs={12} sm={6} md={4}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Link
                    href={`mailto:${
                      officersEmails.join(',').length < MAX_MAILTO
                        ? officersEmails.join(',')
                        : officersEmailsShort.join(',').length < 2000
                        ? officersEmailsShort.join(',')
                        : ''
                    }`}
                  >
                    <Typography variant='h4'>{`Executive Board (${officers.length})`}</Typography>
                  </Link>
                  <Typography color='text.secondary' sx={{ flex: 1 }}>
                    Only Executive Board officers
                  </Typography>
                </Stack>
                <Tooltip title='Copy to Clipboard'>
                  <IconButton sx={{ height: 40 }} onClick={handleCopyOfficers}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Link
                    href={`mailto:${
                      memebrsEmails.join(',').length < MAX_MAILTO
                        ? memebrsEmails.join(',')
                        : memebrsEmailsShort.join(',').length < MAX_MAILTO
                        ? memebrsEmailsShort.join(',')
                        : ''
                    }`}
                  >
                    <Typography variant='h4'>{`Members (${memebrs.length})`}</Typography>
                  </Link>
                  <Typography color='text.secondary' sx={{ flex: 1 }}>
                    All Active Members
                  </Typography>
                </Stack>
                <Tooltip title='Copy to Clipboard'>
                  <IconButton sx={{ height: 40 }} onClick={handleCopyMembers}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Link
                    href={`mailto:${
                      activeMemberEmails.join(',').length < MAX_MAILTO
                        ? activeMemberEmails.join(',')
                        : activeMemberEmailsShort.join(',').length < MAX_MAILTO
                        ? activeMemberEmailsShort.join(',')
                        : ''
                    }`}
                  >
                    <Typography variant='h4'>
                      {`Active Membership (${activeMember.length})`}
                    </Typography>
                  </Link>
                  <Typography color='text.secondary' sx={{ flex: 1 }}>
                    All Active Members and Canidates
                  </Typography>
                </Stack>
                <Tooltip title='Copy to Clipboard'>
                  <IconButton sx={{ height: 40 }} onClick={handleCopyActiveMembers}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      <Popover
        open={officeOpen}
        anchorEl={officeEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert severity='success'>Copied</Alert>
      </Popover>
      <Popover
        open={memberOpen}
        anchorEl={memberEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert severity='success'>Copied</Alert>
      </Popover>
      <Popover
        open={activeOpen}
        anchorEl={activeEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Alert severity='success'>Copied</Alert>
      </Popover>
    </React.Fragment>
  )
}
