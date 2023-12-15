import * as React from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { ENDPOINT, MIN_EVENTS, MIN_RIDES, ROLE } from '@/utils/constants'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { LogsByMember, Member } from '@/types/common'
import { useSession } from 'next-auth/react'
import DateDisplay from '@/component/date.display'
import FuzzySearch from 'fuzzy-search'
import Head from 'next/head'
import Link from '@/component/link'
import moment from 'moment'

import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Box,
  Container,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Header from '@/component/header'
import SearchToolbar from '@/component/search.toolbar'

type DueMember = {
  eligible?: boolean
} & LogsByMember

export default function DuesPage() {
  const { status, data } = useSession()
  const isAdmin = status === 'authenticated' && !!data.user.office
  const initialYear = React.useMemo(() => {
    const now = moment()

    return now.year() + (now.month() >= 10 ? 1 : 0)
  }, [])
  const [dueYear, setDueYear] = React.useState<number | null>(initialYear)
  const [unpaidSearchTerm, setUnpaidSearchTerm] = React.useState('')
  const [paidSearchTerm, setPaidSearchTerm] = React.useState('')
  const [members, setMembers] = React.useState<DueMember[]>([])
  const [fetching, setFetching] = React.useState(false)
  const [showPastMembers, setShowPastMembers] = React.useState(false)
  const paidMembers = React.useMemo(() => {
    if (!dueYear) return []

    return members.filter(
      (entry) =>
        entry.member.isLifeTimeMember ||
        (!!entry.member.lastPaidDues ? entry.member.lastPaidDues >= dueYear : false),
    )
  }, [dueYear, members])
  const unpaidMembers = React.useMemo(() => {
    if (!dueYear) return []

    return members.filter((entry) =>
      !!entry.member.lastPaidDues ? entry.member.lastPaidDues < dueYear : true,
    )
  }, [dueYear, members])
  const fuzzyUnpaidMembers = React.useMemo(() => {
    const searcher = new FuzzySearch(unpaidMembers, ['member.name', 'member.nickName'], {
      sort: true,
    })

    if (unpaidSearchTerm) return searcher.search(unpaidSearchTerm)

    return []
  }, [unpaidSearchTerm, unpaidMembers])
  const fuzzyPaidMembers = React.useMemo(() => {
    const searcher = new FuzzySearch(paidMembers, ['member.name', 'member.nickName'], {
      sort: true,
    })

    if (paidSearchTerm) return searcher.search(paidSearchTerm)

    return []
  }, [paidSearchTerm, paidMembers])
  const unpaidList = unpaidSearchTerm ? fuzzyUnpaidMembers : unpaidMembers
  const paidList = paidSearchTerm ? fuzzyPaidMembers : paidMembers
  const [loadingMap, setLoadingMap] = React.useState<{ [key: string]: boolean }>({})
  const unpaidCount = React.useMemo(() => {
    if (fetching || unpaidMembers.length === 0) return ''
    if (unpaidSearchTerm.length) return `${fuzzyUnpaidMembers.length} of ${unpaidMembers.length}`

    return unpaidMembers.length
  }, [fetching, unpaidMembers, unpaidSearchTerm, fuzzyUnpaidMembers])
  const paidCount = React.useMemo(() => {
    if (fetching || paidMembers.length === 0) return ''
    if (paidSearchTerm.length) return `${fuzzyPaidMembers.length} of ${paidMembers.length}`

    return paidMembers.length
  }, [fetching, paidMembers, paidSearchTerm, fuzzyPaidMembers])

  async function handlePaidClick(member: Member) {
    try {
      setLoadingMap((prev) => ({ ...prev, [member.id]: true }))
      const response = await fetch(`${ENDPOINT.MEMBER}${member.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...member, lastPaidDues: `${dueYear}` }),
      })
      const data = (await response.json()) as Member
      const index = members.findIndex((entry) => entry.member.id === data.id)

      if (index !== -1) {
        const newMemberList = [...members]
        const newMember = { ...newMemberList[index], member: data }

        newMemberList.splice(index, 1, newMember)
        setMembers(newMemberList)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoadingMap((prev) => ({ ...prev, [member.id]: false }))
    }
  }

  async function handlePastMemeberToggle(event: React.ChangeEvent<HTMLInputElement>) {
    setShowPastMembers(event.target.checked)
  }

  React.useEffect(() => {
    async function getMembers() {
      setFetching(true)
      setLoadingMap({})
      const start = moment().startOf('year')
      const end = moment().endOf('year')

      const queryParams = new URLSearchParams({
        start: start.format(),
        end: end.format(),
        includeInactiveMembers: showPastMembers ? 'true' : 'false',
      })

      const response = await fetch(`${ENDPOINT.LOGS_BY_MEMBER}?${queryParams.toString()}`)
      const newMembers = await response.json()
      const cutOffDate = moment(start).month(6).startOf('month')

      setMembers(
        newMembers.map((entry: LogsByMember): DueMember => {
          const isSupporter = entry.member.role === ROLE.SUPPORTER
          const joinedDate = moment(entry.member.joined)
          let eligible = joinedDate.isAfter(cutOffDate) || entry.member.isLifeTimeMember

          if (!eligible && isSupporter) {
            eligible = entry.events >= MIN_EVENTS
          } else if (!eligible) {
            const rides = entry.breakdown.Ride.events

            eligible =
              rides >= MIN_RIDES &&
              Math.max(entry.events - Math.min(rides, MIN_RIDES), 0) >= MIN_EVENTS - MIN_RIDES
          }

          return { ...entry, eligible }
        }),
      )
      setFetching(false)
    }

    getMembers()
  }, [showPastMembers])

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Dues</title>
        <meta name='description' content='american legion riders chapter 91 membership dues' />
      </Head>
      <Header />
      <Container maxWidth='xl'>
        <Stack spacing={1}>
          <Paper sx={{ p: 2 }}>
            {status === 'loading' ? (
              <LinearProgress />
            ) : status === 'unauthenticated' || !isAdmin ? (
              <Alert severity='error'>Not Authorized</Alert>
            ) : (
              <Typography component='h1' variant='h5' sx={{ flexGrow: 1 }}>
                Membership Dues
              </Typography>
            )}
          </Paper>
          {isAdmin && (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Paper sx={{ p: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    pt: 1,
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  <DateDisplay
                    value={moment(dueYear, 'YYYY')}
                    views={['year']}
                    label='Update Paid Dues To'
                    onChange={(value) => setDueYear(value ? value.year() : value)}
                    editing
                    fullWidth
                    disabled={fetching}
                  />
                  <FormControlLabel
                    control={
                      <Switch checked={showPastMembers} onChange={handlePastMemeberToggle} />
                    }
                    label='Show Past Members'
                    sx={{ minWidth: 210 }}
                    disabled={fetching}
                  />
                </Box>
              </Paper>
              {!dueYear && (
                <Alert severity='warning'>
                  Please select a year to update the membership dues to
                </Alert>
              )}

              <Paper>
                <SearchToolbar
                  title={`Unpaid Members${unpaidCount ? ` (${unpaidCount})` : ''}`}
                  onSearchChange={(term) => setUnpaidSearchTerm(term)}
                  hideSearch={fetching}
                />
                {fetching ? (
                  <Box p={2}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            Status
                          </TableCell>
                          <TableCell align='right' sx={{ width: '100px' }}>
                            Last Paid
                          </TableCell>
                          <TableCell sx={{ width: '100px' }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {unpaidList.map((entry) => (
                          <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            key={entry.member.id}
                          >
                            <TableCell sx={{ position: 'relative' }}>
                              <Box
                                sx={{
                                  bgcolor: entry.eligible ? 'green' : 'red',
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: 0,
                                  width: 15,
                                }}
                              />
                              <Link
                                href={`/member/${entry.member.id}`}
                                target='_blank'
                                sx={{ pl: 2 }}
                              >
                                {entry.member.name}
                              </Link>
                            </TableCell>
                            <TableCell>{entry.member.email}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                              {entry.eligible ? 'Eligible' : 'Not Eligible'}
                            </TableCell>
                            <TableCell align='right'>{entry.member.lastPaidDues}</TableCell>
                            <TableCell align='right'>
                              <Box
                                display='flex'
                                gap={1}
                                alignItems='center'
                                justifyContent='center'
                                width='100%'
                              >
                                <LoadingButton
                                  loading={loadingMap[entry.member.id]}
                                  variant='outlined'
                                  onClick={() => handlePaidClick(entry.member)}
                                >
                                  Paid
                                </LoadingButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {unpaidList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Alert severity={!!unpaidSearchTerm ? 'warning' : 'success'}>
                                {!!unpaidSearchTerm
                                  ? `No Members match ${unpaidSearchTerm}`
                                  : 'No Unpaid Members'}
                              </Alert>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              <Paper>
                <SearchToolbar
                  title={`Paid Members${paidCount ? `(${paidCount})` : ''}`}
                  onSearchChange={(term) => setPaidSearchTerm(term)}
                  hideSearch={fetching}
                />
                {fetching ? (
                  <Box p={2}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell align='right' sx={{ width: '100px' }}>
                            Last Paid
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paidList.map((entry) => (
                          <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            key={entry.member.id}
                          >
                            <TableCell component='th' scope='row'>
                              <Box display='flex' alignItems='center' sx={{ gap: 1 }}>
                                <Link
                                  sx={{ minWidth: 200 }}
                                  href={`/member/${entry.member.id}`}
                                  target='_blank'
                                >
                                  {entry.member.name}
                                </Link>

                                {entry.member.isLifeTimeMember && (
                                  <Typography
                                    sx={{
                                      pr: { xs: 0, sm: 2, md: 4 },
                                      fontFamily: 'monospace',
                                      color: 'rgb(255, 100, 0)',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    LIFETIME
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align='right'>{entry.member.lastPaidDues}</TableCell>
                          </TableRow>
                        ))}
                        {paidList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <Alert severity={!!paidSearchTerm ? 'warning' : 'error'}>
                                {!!paidSearchTerm
                                  ? `No Members match ${paidSearchTerm}`
                                  : 'No Paid Members'}
                              </Alert>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </LocalizationProvider>
          )}
        </Stack>
      </Container>
    </React.Fragment>
  )
}
