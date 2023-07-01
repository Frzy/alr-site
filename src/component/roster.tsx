import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import { ENDPOINT, MEMBER_ROLES, ROLE } from '@/utils/constants'
import { Box, Paper, LinearProgress, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import RosterItem from './roster.item'

import type { Member } from '@/types/common'
import { officerSort } from '@/utils/helpers'

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
  const officers = roster.filter((m) => !!m.office).sort(officerSort)
  const members = roster.filter((m) => !m.office && m.isActive)
  const prospects = roster.filter((m) => m.role === ROLE.PROSPECT)

  return (
    <Stack spacing={1}>
      <Paper sx={{ position: 'relative' }}>
        <Toolbar sx={{ bgcolor: 'grey' }}>
          <Typography variant='h5'>Executive Board</Typography>
        </Toolbar>
        {isLoading ? (
          <LinearProgress color='primary' />
        ) : officers.length ? (
          <Box
            display='flex'
            sx={{ flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap' }}
            gap={1}
            py={1}
            px={0.5}
          >
            {officers.map((m) => (
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
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' p={3}>
            <Typography variant='h5'>No Officers Currently Availible</Typography>
          </Box>
        )}
      </Paper>
      <Paper sx={{ position: 'relative' }}>
        <Toolbar sx={{ bgcolor: 'grey' }}>
          <Typography variant='h5'>Active Roster</Typography>
        </Toolbar>
        {isLoading ? (
          <LinearProgress color='primary' />
        ) : members.length ? (
          <Box
            display='flex'
            sx={{ flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap' }}
            gap={1}
            py={1}
            px={0.5}
          >
            {isLoading && <LinearProgress color='primary' />}
            {members.map((m) => (
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
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' p={3}>
            <Typography variant='h5'>No Members Currently Availible </Typography>
          </Box>
        )}
      </Paper>
      {!!prospects.length && (
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
            {isLoading && <LinearProgress color='primary' />}
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
      )}
    </Stack>
  )
}
