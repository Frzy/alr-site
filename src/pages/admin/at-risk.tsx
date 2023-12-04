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
import DateDisplay from '@/component/date.display'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

const fetcher: Fetcher<AtRiskMember[], [string, URLSearchParams | undefined]> =
  async function fetcher([url, queryParams]) {
    const response = await fetch(queryParams ? `${url}?${queryParams.toString()}` : url)

    return (await response.json()) as AtRiskMember[]
  }

export default function AdminAtRiskPage() {
  const { status, data: session } = useSession()
  const isAdmin = !!session?.user.office && status === 'authenticated'
  const [year, setYear] = React.useState(moment().year() + 1)

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
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Paper sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Below is a list of members that have not met the participtation requirments for
                  the club. Use the dropdown below to pick year to check.
                </Typography>
                <Alert severity='info' sx={{ mb: 2 }}>
                  Please note that after choosing a year, the tool will check the activity log
                  entries for the previous year to check for eligibility.
                </Alert>
                <DateDisplay
                  label='Eligibility Year'
                  value={moment(year, 'YYYY')}
                  views={['year']}
                  minDate={moment('2021', 'YYYY').startOf('year')}
                  maxDate={moment().add(1, 'year').startOf('year')}
                  onChange={(date) => {
                    if (date) {
                      setYear(date.year())
                    } else {
                      setYear(moment().year() + 1)
                    }
                  }}
                  fullWidth
                  editing
                />
              </Paper>
              <AtRiskView year={year.toString()} />
            </Stack>
          </LocalizationProvider>
        )}
      </Container>
    </React.Fragment>
  )
}

function AtRiskView({ year }: { year: string }) {
  const queryParams = React.useMemo(() => {
    return new URLSearchParams({ year })
  }, [year])
  const { data, isLoading } = useSWR([ENDPOINT.AT_RISK_MEMBERS, queryParams], fetcher, {
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
    <Box>
      <SearchToolbar
        title={`At Risk Members for ${year}`}
        onSearchChange={setAtRiskSearchTerm}
        hideSearch={isLoading}
      />
      {isLoading ? (
        <Paper sx={{ p: 2 }}>
          <LinearProgress />
        </Paper>
      ) : (
        <Paper>
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
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{`${entry.events} of ${MIN_EVENTS}`}</TableCell>
                    <TableCell align='right'>
                      {entry.eligible ? 'Eligible' : 'Not Eligible'}
                    </TableCell>
                  </TableRow>
                ))}

                {atRiskMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Alert severity={!!atRiskSearchTerm ? 'warning' : 'success'}>
                        {!!atRiskSearchTerm
                          ? `No Members match ${atRiskSearchTerm}`
                          : 'No Members are at Risk'}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
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
        </Paper>
      )}
    </Box>
  )
}
