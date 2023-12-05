import { useMemo } from 'react'
import moment from 'moment'
import { Box, Paper, Stack, Typography, LinearProgress, LinearProgressProps } from '@mui/material'

import type { ActivityLog, Member } from '@/types/common'
import { ACTIVITY_TYPE, MIN_EVENTS, MIN_RIDES, ROLE } from '@/utils/constants'

interface MemberYearlyRequirmentsProps {
  member: Member
  logs?: ActivityLog[]
  year?: number
}

function LinearProgressWithLabel({
  label,
  ...props
}: LinearProgressProps & { value: number; label?: string }) {
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

export default function MemberYearlyRequirments({
  member,
  logs = [],
  year = moment().year(),
}: MemberYearlyRequirmentsProps) {
  const isSupporter = member.role === ROLE.SUPPORTER
  const counts = useMemo(() => {
    const startDate = moment(year, 'YYYY').startOf('year')
    const endDate = moment(year, 'YYYY').add(1, 'year').endOf('month')

    return logs
      .filter((log) => {
        return moment(log.date).isBetween(startDate, endDate)
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
  const progress = isSupporter
    ? (Math.min(counts.total, MIN_EVENTS) / MIN_EVENTS) * 100
    : ((Math.min(counts.rides, MIN_RIDES) + Math.min(counts.events, MIN_EVENTS - MIN_RIDES)) /
        MIN_EVENTS) *
      100

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Typography component={'h2'} variant='h4'>
          {year + 1} Membership Progress
        </Typography>
        <LinearProgressWithLabel value={progress} />
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
      </Stack>
    </Paper>
  )
}
