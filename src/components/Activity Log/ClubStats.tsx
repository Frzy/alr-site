import { flattenBreakdown } from '@/utils/helpers'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import type { ActivityLogStats } from '@/types/common'

interface ClubStatsProps {
  stats: Omit<ActivityLogStats, 'entriesByMember' | 'latestEntries'>
}

export default function ClubStats({ stats }: ClubStatsProps): JSX.Element {
  return (
    <Grid container spacing={2} sx={{ pt: 1 }}>
      <Grid xs={12} sm={6} md={4}>
        <Typography variant='h6' sx={{ textAlign: { xs: 'left', md: 'center' } }}>
          Total Participation: {stats.events.toLocaleString()}
        </Typography>
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <Typography variant='h6' sx={{ textAlign: { xs: 'left', md: 'center' } }}>
          Total Hours: {stats.hours.toLocaleString()}
        </Typography>
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <Typography variant='h6' sx={{ textAlign: { xs: 'left', md: 'center' } }}>
          Total Miles: {stats.miles.toLocaleString()}
        </Typography>
      </Grid>
      <Grid xs={12} sx={{ pb: 0 }}>
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
            {flattenBreakdown(stats.breakdown).map((r, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  },
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
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
      </Grid>
    </Grid>
  )
}
