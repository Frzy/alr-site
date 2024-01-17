import type { ActivityLogStats } from '@/types/common'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

interface LatestActivityLogsProps {
  logs: ActivityLogStats['latestEntries']
}

export default function LatestActivityLogs({ logs }: LatestActivityLogsProps): JSX.Element {
  const now = dayjs()

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label='latest log entries'>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align='right' sx={{ minWidth: 125 }}>
              Activity Name
            </TableCell>
            <TableCell align='right' sx={{ minWidth: 125 }}>
              Activity Type
            </TableCell>
            <TableCell align='right'>Hours</TableCell>
            <TableCell align='right'>Miles</TableCell>
            <TableCell align='right' sx={{ minWidth: 125 }}>
              Entered
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((entry, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <TableCell component='th' scope='row'>
                {entry.name}
              </TableCell>
              <TableCell align='right'>{entry.activityName}</TableCell>
              <TableCell align='right'>{entry.activityType}</TableCell>
              <TableCell align='right'>{entry.hours}</TableCell>
              <TableCell align='right'>{entry.miles}</TableCell>
              <TableCell align='right'>
                <Tooltip title={entry.created}>
                  <Typography variant='caption' color='text.seconday'>
                    {dayjs(entry.created).from(now)}
                  </Typography>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
