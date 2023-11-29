import * as React from 'react'
import { Alert, Box, Divider, Skeleton, Stack, Toolbar, Typography } from '@mui/material'
import { ENDPOINT, MEMBER_ROLES, RIDER_ROLES, ROLE } from '@/utils/constants'
import { queryRequest } from '@/utils/api'
import useSWR, { Fetcher } from 'swr'
import type { Member, MembershipStats as IMembershipStats } from '@/types/common'

import RiderIcon from '@mui/icons-material/TwoWheeler'
import SupporterIcon from '@mui/icons-material/VolunteerActivism'
import ProspectIcon from '@mui/icons-material/Moped'
import MemberIcon from '@mui/icons-material/SportsMotorsports'

const fetcher: Fetcher<IMembershipStats, string> = async (url: string) => {
  const response = await queryRequest('GET', url)
  const data = (await response.json()) as IMembershipStats

  return data
}

export default function MembershipStats() {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(ENDPOINT.ROSTER_STATS, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const activeRiders = React.useMemo(() => {
    let riders = 0

    if (!stats) return 0

    for (let [key, value] of Object.entries(stats)) {
      if (RIDER_ROLES.indexOf(key as ROLE) !== -1) riders += value
    }

    return riders
  }, [stats])
  const totalMembers = React.useMemo(() => {
    let members = 0

    if (!stats) return 0

    for (let [key, value] of Object.entries(stats)) {
      if (MEMBER_ROLES.indexOf(key as ROLE) !== -1) members += value
    }

    return members
  }, [stats])

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Alert severity='error'>There was a problem fetching the membership stats</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Toolbar sx={{ bgcolor: (theme) => theme.vars.palette.rosterHeader }}>
        <Typography variant='h5'>Membership</Typography>
      </Toolbar>
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
          <Divider />
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <Skeleton variant='circular' animation='wave' width={48} height={48} />
            <Skeleton variant='rectangular' animation='wave' height={48} sx={{ flexGrow: 1 }} />
            <Skeleton variant='rounded' animation='wave' width={48} height={48} />
          </Box>
        </Stack>
      ) : !!stats ? (
        <Stack sx={{ p: 1 }} spacing={1}>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <RiderIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>Riders</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {activeRiders}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <SupporterIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>{ROLE.SUPPORTER}s</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {stats[ROLE.SUPPORTER]}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <ProspectIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>{ROLE.PROSPECT}s</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {stats[ROLE.PROSPECT] + stats[ROLE.CANIDATE_SUPPORTER]}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', gap: 3, p: 2, alignItems: 'center' }}>
            <MemberIcon sx={{ fontSize: 48 }} />
            <Typography variant='h5'>Total Members</Typography>
            <Typography variant='h5' flexGrow={1} fontWeight='fontWeightBold' textAlign='right'>
              {totalMembers}
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <Alert severity='error'>There was a problem fetching the membership stats</Alert>
        </Box>
      )}
    </Box>
  )
}
