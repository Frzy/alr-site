import * as React from 'react'
import { Alert, Box, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { ENDPOINT, MEMBER_ROLES, RIDER_ROLES, ROLE } from '@/utils/constants'
import { queryRequest } from '@/utils/api'
import useSWR, { Fetcher } from 'swr'
import type { ActivityLogStats } from '@/types/common'

import HourIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'
import MileIcon from '@mui/icons-material/SocialDistance'

const fetcher: Fetcher<ActivityLogStats, string> = async (url: string) => {
  const response = await queryRequest('GET', url)
  const data = (await response.json()) as ActivityLogStats

  return data
}

export default function ActivityLogStats() {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(ENDPOINT.LOGS_STATS, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error || !stats)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Alert severity='error'>There was a problem fetching the activity log stats</Alert>
      </Box>
    )

  return (
    <Box>
      <Typography sx={{ p: 1 }} variant='h4'>
        Membership
      </Typography>
      <Divider />
      {isLoading ? (
        <Stack sx={{ p: 1 }} spacing={1}>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <Skeleton variant='circular' animation='wave' width={48} height={48} />
            <Skeleton variant='rectangular' animation='wave' height={48} sx={{ flexGrow: 1 }} />
            <Skeleton variant='rounded' animation='wave' width={48} height={48} />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <Skeleton variant='circular' animation='wave' width={48} height={48} />
            <Skeleton variant='rectangular' animation='wave' height={48} sx={{ flexGrow: 1 }} />
            <Skeleton variant='rounded' animation='wave' width={48} height={48} />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <Skeleton variant='circular' animation='wave' width={48} height={48} />
            <Skeleton variant='rectangular' animation='wave' height={48} sx={{ flexGrow: 1 }} />
            <Skeleton variant='rounded' animation='wave' width={48} height={48} />
          </Box>
        </Stack>
      ) : (
        <Stack sx={{ p: 1 }} spacing={1}>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <EventIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>Events</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {stats.events}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <HourIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>Hours</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {stats.hours}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <MileIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>Miles</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {stats.miles}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
