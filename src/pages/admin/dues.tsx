import * as React from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { alpha, useTheme } from '@mui/material/styles'
import { authOptions } from '@/lib/auth'
import { ENDPOINT } from '@/utils/constants'
import { getMembersBy } from '@/lib/roster'
import { getServerSession } from 'next-auth'
import { GetServerSideProps } from 'next'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Member } from '@/types/common'
import { useSession } from 'next-auth/react'
import DateDisplay from '@/component/date.display'
import FuzzySearch from 'fuzzy-search'
import Head from 'next/head'
import moment from 'moment'
import SearchIcon from '@mui/icons-material/Search'

import {
  Alert,
  Box,
  Button,
  InputBase,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material'

export const getServerSideProps: GetServerSideProps<DuesPageProps> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions)

  if (!!session?.user && !!session.user.office) {
    const members = await getMembersBy((m) => m.isActive)

    members.sort((a, b) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1

      return 0
    })

    return { props: { members } }
  }

  return {
    props: { members: [] as Member[] },
  }
}

type DuesPageProps = {
  members: Member[]
}

type TableTitleProps = {
  title: string
  count?: number | string
  searchable?: boolean
  onSearchChange?: (term: string) => void
}
function TableTitle({ title, count, searchable, onSearchChange }: TableTitleProps) {
  const theme = useTheme()
  const colorScheme = theme.colorSchemes[theme.palette.mode]
  const [searchTerm, setSearchTerm] = React.useState('')

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        bgcolor: alpha(
          colorScheme.palette.primary.main,
          colorScheme.palette.action.activatedOpacity,
        ),
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

export default function DuesPage({ members: initMembers }: DuesPageProps) {
  const { status, data } = useSession()
  const isAdmin = status === 'authenticated' && !!data.user.office
  const initialYear = React.useMemo(() => {
    const now = moment()

    return now.year() + (now.month() >= 10 ? 1 : 0)
  }, [])
  const [dueYear, setDueYear] = React.useState<number | null>(initialYear)
  const [unpaidSearchTerm, setUnpaidSearchTerm] = React.useState('')
  const [paidSearchTerm, setPaidSearchTerm] = React.useState('')
  const [members, setMembers] = React.useState(initMembers)
  const paidMembers = React.useMemo(() => {
    if (!dueYear) return []

    return members.filter(
      (m) => m.isLifeTimeMember || (!!m.lastPaidDues ? m.lastPaidDues >= dueYear : false),
    )
  }, [dueYear, members])
  const unpaidMembers = React.useMemo(() => {
    if (!dueYear) return []

    return members.filter((m) => (!!m.lastPaidDues ? m.lastPaidDues < dueYear : true))
  }, [dueYear, members])
  const fuzzyUnpaidMembers = React.useMemo(() => {
    const searcher = new FuzzySearch(unpaidMembers, ['name', 'nickName'], { sort: true })

    if (unpaidSearchTerm) return searcher.search(unpaidSearchTerm)

    return []
  }, [unpaidSearchTerm, unpaidMembers])
  const fuzzyPaidMembers = React.useMemo(() => {
    const searcher = new FuzzySearch(paidMembers, ['name', 'nickName'], { sort: true })

    if (paidSearchTerm) return searcher.search(paidSearchTerm)

    return []
  }, [paidSearchTerm, paidMembers])
  const unpaidList = unpaidSearchTerm ? fuzzyUnpaidMembers : unpaidMembers
  const paidList = paidSearchTerm ? fuzzyPaidMembers : paidMembers

  async function handlePaidClick(member: Member) {
    try {
      const response = await fetch(`${ENDPOINT.MEMBER}${member.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...member, lastPaidDues: `${dueYear}` }),
      })
      const data = (await response.json()) as Member
      const index = members.findIndex((m) => m.id === data.id)

      if (index !== -1) {
        const newMemberList = [...members]

        newMemberList.splice(index, 1, data)
        setMembers(newMemberList)
      }
    } catch (e) {
      console.log(e)
    }
  }

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
            <h1>Not Authorized</h1>
          ) : (
            <Typography component='h1' variant='h4' sx={{ flexGrow: 1 }}>
              Membership Dues
            </Typography>
          )}
        </Paper>
        {isAdmin && (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Paper sx={{ p: 1 }}>
              <DateDisplay
                value={moment(dueYear, 'YYYY')}
                views={['year']}
                label='Update Paid Dues To'
                onChange={(value) => setDueYear(value ? value.year() : value)}
                editing
                fullWidth
              />
            </Paper>
            {!dueYear && (
              <Alert severity='warning'>
                Please select a year to update the membership dues to
              </Alert>
            )}
            {unpaidMembers.length > 0 && (
              <Paper>
                <TableTitle
                  title='Unpaid Members'
                  count={
                    unpaidSearchTerm
                      ? `${fuzzyUnpaidMembers.length} of ${unpaidMembers.length}`
                      : unpaidMembers.length
                  }
                  onSearchChange={(term) => setUnpaidSearchTerm(term)}
                  searchable
                />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align='right' sx={{ width: '100px' }}>
                          Last Paid
                        </TableCell>
                        <TableCell sx={{ width: '100px' }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unpaidList.map((member) => (
                        <TableRow
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          key={member.id}
                        >
                          <TableCell component='th' scope='row'>
                            {member.name}
                          </TableCell>
                          <TableCell align='right'>{member.lastPaidDues}</TableCell>
                          <TableCell align='right'>
                            <Box
                              display='flex'
                              gap={1}
                              alignItems='center'
                              justifyContent='center'
                              width='100%'
                            >
                              <Button onClick={() => handlePaidClick(member)}>Paid</Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
            {paidMembers.length > 0 && (
              <Paper>
                <TableTitle
                  title='Paid Members'
                  count={
                    paidSearchTerm
                      ? `${fuzzyPaidMembers.length} of ${paidMembers.length}`
                      : paidMembers.length
                  }
                  onSearchChange={(term) => setPaidSearchTerm(term)}
                  searchable
                />
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
                      {paidList.map((member) => (
                        <TableRow
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          key={member.id}
                        >
                          <TableCell component='th' scope='row'>
                            <Box display='flex' alignItems='center' sx={{ gap: 1 }}>
                              <Typography sx={{ minWidth: 200 }}>{member.name}</Typography>
                              {member.isLifeTimeMember && (
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
                          <TableCell align='right'>{member.lastPaidDues}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </LocalizationProvider>
        )}
      </Stack>
    </React.Fragment>
  )
}