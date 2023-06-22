import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import { ENDPOINT, ENTITY, ENTITY_COLOR, MEMBER_ROLE } from '@/utils/constants'
import { Avatar, Box, Chip, Paper, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import RosterItem from './roster.item'

import type { Member } from '@/types/common'

const fetcher: Fetcher<Member[], string[]> = async (args) => {
  const [url] = args

  const response = await fetch(url)

  const data = (await response.json()) as Member[]

  return data
}

export default function Roster() {
  const { data: roster, isLoading } = useSWR([ENDPOINT.ROSTER], fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  })
  const activeMembers = roster.filter((m) => m.isActive)
  const prospects = roster.filter((m) => m.role === MEMBER_ROLE.PROSPECT)
  const charterMembers = roster.filter((m) => m.role === MEMBER_ROLE.CHARTER)

  return (
    <Stack spacing={1}>
      <Paper sx={{ position: 'relative' }}>
        <Toolbar sx={{ bgcolor: 'grey' }}>
          <Typography variant='h5'>Active Roster</Typography>
        </Toolbar>
        <Box
          display='flex'
          sx={{ flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap' }}
          gap={1}
          py={1}
          px={0.5}
        >
          {activeMembers.map((m) => (
            <RosterItem
              key={m.id}
              member={m}
              sx={{
                position: 'relative',
                width: {
                  xs: '100%',
                  md: 'calc(50% - 8px)',
                  lg: 'calc(33.3% - 8px)',
                  xl: 'calc(25% - 8px)',
                },
              }}
            />
          ))}
        </Box>
      </Paper>
      <Paper sx={{ position: 'relative' }}>
        <Toolbar sx={{ bgcolor: 'grey' }}>
          <Typography variant='h5'>Canidates</Typography>
        </Toolbar>
        <Box
          display='flex'
          sx={{ flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap' }}
          gap={1}
          py={1}
          px={0.5}
        >
          {prospects.map((m) => (
            <RosterItem
              key={m.id}
              member={m}
              sx={{
                position: 'relative',
                width: {
                  xs: '100%',
                  md: 'calc(50% - 8px)',
                  lg: 'calc(33.3% - 8px)',
                  xl: 'calc(25% - 8px)',
                },
              }}
            />
          ))}
        </Box>
      </Paper>
    </Stack>
  )
}
