import * as React from 'react'
import { Alert, Box, Divider, Stack, Typography } from '@mui/material'
import { ENDPOINT } from '@/utils/constants'
import RosterItem, { SkeletonRosterItem } from './roster.item'
import useSWR, { Fetcher } from 'swr'

import type { Member } from '@/types/common'
import { queryRequest } from '@/utils/api'

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
      {isLoading ? (
        <Stack sx={{ p: 1 }} spacing={1}>
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <SkeletonRosterItem key={index} />
            ))}
        </Stack>
      ) : (
        <Stack sx={{ p: 1 }} spacing={1}>
          {officers?.map((o, index) => (
            <RosterItem key={index} member={o} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
