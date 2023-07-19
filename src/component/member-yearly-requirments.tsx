import { useMemo } from 'react'
import moment from 'moment'
import { Box, Paper, Stack, Typography, LinearProgress, LinearProgressProps } from '@mui/material'

import type { ActivityLog, Member } from '@/types/common'
import Image from 'next/image'
import { ACTIVITY_TYPE, ROLE } from '@/utils/constants'

interface MemberYearlyRequirmentsProps {
  member: Member
  logs?: ActivityLog[]
  year?: number
}

const MIN_RIDES = 4
const MIN_EVENTS = 12

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
          return {
            rides: cur.rides + (next.activityType === ACTIVITY_TYPE.RIDE ? 1 : 0),
            events: cur.events + 1,
          }
        },
        { rides: 0, events: 0 },
      )
  }, [logs, year])

  return (
    <Paper sx={{ p: 1 }}>
      <Stack spacing={1}>
        <Typography component={'h2'} variant='h4'>
          {year} Membership Progress
        </Typography>
        <LinearProgressWithLabel value={(Math.min(counts.events, MIN_EVENTS) / MIN_EVENTS) * 100} />
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
              : {Math.min(counts.events, MIN_EVENTS)} of {MIN_EVENTS}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}
