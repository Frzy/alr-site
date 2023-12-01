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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Tooltip,
  TableRow,
  Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import SearchToolbar from '@/component/search.toolbar'
import useSWR, { Fetcher } from 'swr'
import { ENDPOINT, MAX_MAILTO, MIN_EVENTS, MIN_RIDES, RIDER_ROLES } from '@/utils/constants'
import { AtRiskMember } from '@/types/common'
import moment from 'moment'
import FuzzySearch from 'fuzzy-search'
import Link from '@/component/link'
import CopyIcon from '@mui/icons-material/ContentCopy'
import EmailIcon from '@mui/icons-material/Email'

const fetcher: Fetcher<AtRiskMember[], string> = async function fetcher(url) {
  const response = await fetch(url)
  const data = await response.json()

  return data
}

export default function AdminAtRiskPage() {
  const { status, data: session } = useSession()
  const isAdmin = !!session?.user.office && status === 'authenticated'

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Admin At Risk</title>
        <meta
          name='description'
          content='american legion riders chapter 91 admin at risk members'
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
          <AtRiskView />
        )}
      </Container>
    </React.Fragment>
  )
}

function AtRiskView() {
  const { data, isLoading } = useSWR(ENDPOINT.AT_RISK_MEMBERS, fetcher, {
    fallbackData: [],
  })
  const [atRiskSearchTerm, setAtRiskSearchTerm] = React.useState('')
  const [copyEl, setCopyEl] = React.useState<HTMLButtonElement | null>(null)
  const atRiskMembers = React.useMemo(() => {
    const atRisk = data.filter((m) => !m.eligible)
    if (atRiskSearchTerm) {
      const searcher = new FuzzySearch(atRisk, ['member.name', 'member.nickName'], {
        sort: true,
      })

      return searcher.search(atRiskSearchTerm)
    }

    return atRisk
  }, [data, atRiskSearchTerm])
  const atRiskEmails = React.useMemo(() => {
    const emails = atRiskMembers.filter((m) => !!m.member.email)

    const longEmails = emails.map((m) => `${m.member.name} <${m.member.email}>`).join(',')
    if (longEmails.length < MAX_MAILTO) return longEmails

    const shortEmails = emails.map((m) => m.member.email).join(',')
    if (shortEmails.length < MAX_MAILTO) return shortEmails

    return ''
  }, [atRiskMembers])
  const copyOpen = Boolean(copyEl)

  async function handleCopyEmailToClipboard(event: React.MouseEvent<HTMLButtonElement>) {
    const emails = atRiskMembers
      .filter((m) => m.member.email)
      .map((m) => `${m.member.name} <${m.member.email}>`)

    setCopyEl(event.currentTarget)

    await navigator.clipboard.writeText(emails.join(',\n'))

    setTimeout(() => {
      setCopyEl(null)
    }, 1000)
  }

  return (
    <React.Fragment>
      <SearchToolbar
        title={`At Risk Members for ${moment().year() + 1}`}
        onSearchChange={setAtRiskSearchTerm}
      />
      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <LinearProgress />
        </Paper>
      ) : (
        <Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 200 }}>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ flex: 1 }}>Email</Typography>
                      <Tooltip title='Open Email'>
                        <IconButton size='small' href={`mailto:${atRiskEmails}`}>
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Copy emails to clipboard'>
                        <IconButton size='small' onClick={handleCopyEmailToClipboard}>
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>Rides</TableCell>
                  <TableCell sx={{ minWidth: 90 }}>Events</TableCell>
                  <TableCell align='right' sx={{ minWidth: 120 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {atRiskMembers.map((entry) => (
                  <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    key={entry.member.id}
                  >
                    <TableCell component='th' scope='row' sx={{ position: 'relative' }}>
                      <Link href={`/member/${entry.member.id}`} target='_blank'>
                        {entry.member.name}
                      </Link>
                    </TableCell>
                    <TableCell>{entry.member.role}</TableCell>
                    <TableCell>{entry.member.email}</TableCell>
                    <TableCell>
                      {RIDER_ROLES.indexOf(entry.member.role) !== -1
                        ? `${entry.rides} of ${MIN_RIDES}`
                        : entry.rides}
                    </TableCell>
                    <TableCell>{`${entry.events} of ${MIN_EVENTS}`}</TableCell>
                    <TableCell align='right'>
                      {entry.eligible ? 'Eligible' : 'Not Eligible'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Popover
            open={copyOpen}
            anchorEl={copyEl}
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
        </Box>
      )}
    </React.Fragment>
  )
}
