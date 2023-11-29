import * as React from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { ENDPOINT, MIN_EVENTS, MIN_RIDES, ROLE } from '@/utils/constants'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { LogsByMember, Member } from '@/types/common'
import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import DateDisplay from '@/component/date.display'
import FuzzySearch from 'fuzzy-search'
import Head from 'next/head'
import Link from '@/component/link'
import moment from 'moment'
import SearchIcon from '@mui/icons-material/Search'

import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Box,
  FormControlLabel,
  InputBase,
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
  Toolbar,
  Typography,
} from '@mui/material'

type TableTitleProps = {
  title: string
  count?: number | string
  searchable?: boolean
  onSearchChange?: (term: string) => void
}

type DueMember = {
  eligible?: boolean
} & LogsByMember

function TableTitle({ title, count, searchable, onSearchChange }: TableTitleProps) {
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = React.useState('')

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor: theme.vars.palette.rosterHeader,
        display: searchable ? 'flex' : undefined,
        flexDirection: searchable
          ? {
              xs: 'column',
              md: 'row',
            }
          : 'row',
        paddingBottom: searchable
          ? {
              xs: theme.spacing(1),
              md: 0,
            }
          : 0,
        alignItems: searchable
          ? {
              xs: 'flex-start',
              md: 'center',
            }
          : undefined,
      }}
    >
      <Typography sx={{ flex: '1 1 100%', p: searchable ? 1 : undefined }} variant='h5'>
        {title}
        {count ? ` (${count})` : ''}
      </Typography>
      {searchable && (
        <Box
          sx={{
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.vars.palette.headerSearch.main,
            '&:hover': {
              backgroundColor: theme.vars.palette.headerSearch.hover,
            },
            marginLeft: {
              xs: 0,
              md: theme.spacing(1),
            },
            width: {
              xs: '100%',
              md: 'auto',
            },
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon />
          </Box>
          <InputBase
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                // vertical padding + font size from searchIcon
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: '100%',
                [theme.breakpoints.up('sm')]: {
                  width: '12ch',
                  '&:focus': {
                    width: '50ch',
                  },
                },
              },
            }}
            placeholder='Search…'
            inputProps={{ 'aria-label': 'search' }}
            value={searchTerm}
            onChange={(event) => {
              const { value } = event.target

              setSearchTerm(value)
              if (onSearchChange) onSearchChange(value)
            }}
          />
        </Box>
      )}
    </Toolbar>
  )
}

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

      setMembers(
        newMembers.map((entry: LogsByMember): DueMember => {
          const isSupporter = entry.member.role === ROLE.SUPPORTER
          let eligible = false

          if (isSupporter) {
            eligible = entry.events >= MIN_EVENTS
          } else {
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
                sx={{ display: 'flex', gap: 2, pt: 1, flexDirection: { xs: 'column', md: 'row' } }}
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
                  control={<Switch checked={showPastMembers} onChange={handlePastMemeberToggle} />}
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
              <TableTitle
                title='Unpaid Members'
                count={
                  fetching || unpaidMembers.length === 0
                    ? undefined
                    : unpaidSearchTerm
                    ? `${fuzzyUnpaidMembers.length} of ${unpaidMembers.length}`
                    : unpaidMembers.length
                }
                onSearchChange={(term) => setUnpaidSearchTerm(term)}
                searchable={!fetching}
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
                          <TableCell component='th' scope='row' sx={{ position: 'relative' }}>
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
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Paper>
              <TableTitle
                title='Paid Members'
                count={
                  fetching || paidMembers.length === 0
                    ? undefined
                    : paidSearchTerm
                    ? `${fuzzyPaidMembers.length} of ${paidMembers.length}`
                    : paidMembers.length
                }
                onSearchChange={(term) => setPaidSearchTerm(term)}
                searchable={!fetching}
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
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </LocalizationProvider>
        )}
      </Stack>
    </React.Fragment>
  )
}
