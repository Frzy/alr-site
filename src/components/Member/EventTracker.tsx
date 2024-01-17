import * as React from 'react'
import dayjs from 'dayjs'
import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  type LinearProgressProps,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import type { ActivityLog, Member } from '@/types/common'
import { ACTIVITY_TYPE, MIN_EVENTS, MIN_RIDES, ROLE } from '@/utils/constants'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

interface EventTrackerProps {
  member: Member
  logs?: ActivityLog[]
  year?: number
  disablePast?: boolean
}

const CUTOFF_DATE = dayjs().month(6).startOf('month')

function LinearProgressWithLabel({
  label,
  ...props
}: LinearProgressProps & { value: number; label?: string }): JSX.Element {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {label && (
        <Box sx={{ minWidth: 60 }}>
          <Typography>{label}</Typography>
        </Box>
      )}
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant='body2' color='text.secondary'>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  )
}

export default function EventTracker({
  member,
  logs = [],
  year: initYear = dayjs().year(),
  disablePast,
}: EventTrackerProps): JSX.Element {
  const isSupporter = member.role === ROLE.SUPPORTER
  const [year, setYear] = React.useState(initYear)
  const allYears = React.useMemo(() => {
    const currentYear = dayjs().year()
    const years = logs.reduce<number[]>((prev, next) => {
      const y = dayjs(next.date).year()
      if (!prev.includes(y)) {
        prev.push(y)
      }

      return prev
    }, [])

    if (!years.includes(currentYear)) years.push(currentYear)

    return years.toSorted((a, b) => b - a)
  }, [logs])
  const counts = React.useMemo(() => {
    const startDate = dayjs(year.toString(), 'YYYY').startOf('year')
    const endDate = dayjs(year.toString(), 'YYYY').add(1, 'year')

    return logs
      .filter((log) => {
        return dayjs(log.date).isBetween(startDate, endDate, 'year', '[)')
      })
      .reduce(
        (cur, next) => {
          const nextRide = cur.rides + (next.activityType === ACTIVITY_TYPE.RIDE ? 1 : 0)
          const nextEvent =
            cur.events + (next.activityType !== ACTIVITY_TYPE.RIDE || nextRide > MIN_RIDES ? 1 : 0)

          return {
            rides: nextRide,
            events: nextEvent,
            total: cur.total + 1,
          }
        },
        { rides: 0, events: 0, total: 0 },
      )
  }, [logs, year])
  const skipEligibility = dayjs(member.joined).isAfter(CUTOFF_DATE)
  const progress = React.useMemo(() => {
    if (skipEligibility) return 100

    if (isSupporter) return (Math.min(counts.total, MIN_EVENTS) / MIN_EVENTS) * 100

    return (
      ((Math.min(counts.rides, MIN_RIDES) + Math.min(counts.events, MIN_EVENTS - MIN_RIDES)) /
        MIN_EVENTS) *
      100
    )
  }, [counts, isSupporter, skipEligibility])

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {!disablePast && (
            <FormControl variant='standard' sx={{ minWidth: 60 }}>
              <Select
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '1.3rem',
                    lineHeight: 1.334,
                  },
                }}
                value={year}
                onChange={(event) => {
                  const value =
                    typeof event.target.value === 'string'
                      ? parseInt(event.target.value)
                      : event.target.value

                  setYear(value)
                }}
              >
                {allYears.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Typography component={'h2'} variant='h5'>
            {disablePast ? `${year + 1}` : ''} Membership Progress
          </Typography>
        </Box>
        <LinearProgressWithLabel value={progress} />
        {!skipEligibility ? (
          <Box display='flex' justifyContent='space-around'>
            {!isSupporter && (
              <Box>
                <Typography component='span' fontWeight='fontWeightBold'>
                  Rides
                </Typography>
                <Typography component='span'>
                  : {Math.min(counts.rides, MIN_RIDES)} of {MIN_RIDES}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography component='span' fontWeight='fontWeightBold'>
                Events
              </Typography>
              <Typography component='span'>
                :
                {isSupporter
                  ? ` ${Math.min(counts.events, MIN_EVENTS)} of ${MIN_EVENTS}`
                  : ` ${Math.min(counts.events, MIN_EVENTS - MIN_RIDES)} of ${
                      MIN_EVENTS - MIN_RIDES
                    }`}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography align='center'>
            New Member that joined after {CUTOFF_DATE.format('MMM-YYYY')}.
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}
