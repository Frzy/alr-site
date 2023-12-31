import * as React from 'react'
import { ActivityLogStats, LogsByMember } from '@/types/common'
import { flattenBreakdown } from '@/utils/helpers'
import { getActivityLogStats } from '@/lib/activity.log'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Header from '@/component/header'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Link from '@/component/link'
import moment from 'moment'
import {
  Alert,
  Box,
  Collapse,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import SearchToolbar from '@/component/search.toolbar'
import FuzzySearch from 'fuzzy-search'

export const getServerSideProps: GetServerSideProps<{
  stats: ActivityLogStats
  startDate: string
  endDate: string
}> = async () => {
  const startDate = moment().startOf('year')
  const endDate = moment().endOf('year')
  const stats = await getActivityLogStats(
    (l) => moment(l.date).isBetween(startDate, endDate),
    (m) => m.isActive,
  )

  return { props: { stats, startDate: startDate.format(), endDate: endDate.format() } }
}

export default function LogByMemberPage({
  stats,
  startDate,
  endDate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const fuzzySearcher = React.useMemo(() => {
    return new FuzzySearch(stats.entriesByMember, ['member.name', 'member.nickName'], {
      sort: true,
    })
  }, [stats])
  const members = React.useMemo(() => {
    if (searchTerm) {
      return fuzzySearcher.search(searchTerm)
    }

    return stats.entriesByMember
  }, [searchTerm, stats, fuzzySearcher])
  const start = moment(startDate)
  const end = moment(endDate)

  function handleSearch(term: string) {
    setSearchTerm(term)
  }

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Dashboard</title>
        <meta name='description' content='Generated by create next app' />
      </Head>
      <Header />
      <Container maxWidth='xl'>
        <Paper>
          <SearchToolbar title='Member Activity Summary' onSearchChange={handleSearch} />
          <Alert severity='info'>
            <Typography component='div' variant='body2' color='text.secodary'>
              All Stats gathered from logs between{' '}
              {`${start.format('MMM YYYY')} through ${end.format('MMM YYYY')}`}
            </Typography>
          </Alert>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }}></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align='right' sx={{ minWidth: 125 }}>
                    Total Events
                  </TableCell>
                  <TableCell align='right' sx={{ minWidth: 125 }}>
                    Total Rides
                  </TableCell>
                  <TableCell align='right' sx={{ minWidth: 125 }}>
                    Total Hours
                  </TableCell>
                  <TableCell align='right' sx={{ minWidth: 125 }}>
                    Total Miles
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((entry, index) => (
                  <MembershipLogRow key={index} row={entry} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </React.Fragment>
  )
}

function MembershipLogRow({ row }: { row: LogsByMember }) {
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton aria-label='expand row' size='small' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Link href={`/member/${row.member.id}`} target='_blank'>
            {row.member.name}
          </Link>
        </TableCell>
        <TableCell align='right'>{row.events.toLocaleString()}</TableCell>
        <TableCell align='right'>{row.breakdown.Ride.events.toLocaleString()}</TableCell>
        <TableCell align='right'>{row.hours.toLocaleString()}</TableCell>
        <TableCell align='right'>{row.miles.toLocaleString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant='h6' gutterBottom component='div'>
                Breakdown
              </Typography>

              <Table size='small' aria-label='breakdown'>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Attended</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Miles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flattenBreakdown(row.breakdown).map((r, index) => (
                    <TableRow key={index}>
                      <TableCell component='th' scope='row'>
                        {r.name}
                      </TableCell>
                      <TableCell>{r.events.toLocaleString()}</TableCell>
                      <TableCell>{r.hours.toLocaleString()}</TableCell>
                      <TableCell>{r.miles.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}
