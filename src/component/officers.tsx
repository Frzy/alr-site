import * as React from 'react'
import { Alert, Box, Divider, Stack, Typography } from '@mui/material'
import { ENDPOINT } from '@/utils/constants'
import RosterItem, { SkeletonRosterItem } from './roster.item'
import useSWR, { Fetcher } from 'swr'

import type { Member } from '@/types/common'
import { queryRequest } from '@/utils/api'
import Grid from '@mui/material/Unstable_Grid2'

const fetcher: Fetcher<Member[], string> = async (url: string) => {
  const response = await queryRequest('GET', url)
  const data = (await response.json()) as Member[]

  return data
}

export default function Officers() {
  const {
    data: officers,
    error,
    isLoading,
  } = useSWR(ENDPOINT.OFFICERS, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Alert severity='error'>There was a problem fetching the officers</Alert>
      </Box>
    )

  return (
    <Box>
      <Typography sx={{ p: 1 }} variant='h4'>
        E-Board
      </Typography>
      <Divider />
      <Grid container spacing={1} sx={{ p: 1 }}>
        {isLoading
          ? Array(10)
              .fill(0)
              .map((_, index) => (
                <Grid key={index}>
                  <SkeletonRosterItem />
                </Grid>
              ))
          : officers?.map((o, index) => (
              <Grid key={index} xs={12} sm={6} lg={3}>
                <RosterItem member={o} />
              </Grid>
            ))}
      </Grid>
    </Box>
  )
}
