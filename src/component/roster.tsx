import * as React from 'react'
import useSWR, { Fetcher } from 'swr'
import { ENDPOINT, ROLE } from '@/utils/constants'
import { Box, Paper, LinearProgress, Stack, Toolbar, Typography } from '@mui/material'
import RosterItem from './roster.item'

import type { Member } from '@/types/common'
import { officerSort } from '@/utils/helpers'
import SearchToolbar from './search.toolbar'
import FuzzySearch from 'fuzzy-search'

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
  const initOfficers = React.useMemo(() => {
    return roster.filter((m) => !!m.office).sort(officerSort)
  }, [roster])
  const activeMembers = React.useMemo(() => {
    return roster.filter((m) => !m.office && m.isActive)
  }, [roster])
  const prospects = React.useMemo(() => {
    return roster.filter((m) => m.role === ROLE.PROSPECT || m.role === ROLE.CANIDATE_SUPPORTER)
  }, [roster])
  const [activeSearchTerm, setActiveSearchTerm] = React.useState('')
  const activeSearcher = React.useMemo(() => {
    return new FuzzySearch(activeMembers, ['name', 'nickName'], {
      sort: true,
    })
  }, [activeMembers])
  const members = React.useMemo(() => {
    if (activeSearchTerm) return activeSearcher.search(activeSearchTerm)

    return activeMembers
  }, [activeSearcher, activeSearchTerm, activeMembers])

  const [officerSearchTerm, setOfficerSearchTerm] = React.useState('')
  const officerSearcher = React.useMemo(() => {
    return new FuzzySearch(initOfficers, ['name', 'nickName'], {
      sort: true,
    })
  }, [initOfficers])
  const officers = React.useMemo(() => {
    if (officerSearchTerm) return officerSearcher.search(officerSearchTerm)

    return initOfficers
  }, [officerSearcher, officerSearchTerm, initOfficers])

  return (
    <Stack spacing={1}>
      <Paper sx={{ position: 'relative' }}>
        <SearchToolbar title='Executive Board' onSearchChange={setOfficerSearchTerm} />
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
            {officerSearchTerm ? (
              <Typography variant='h5'>No Matches Found</Typography>
            ) : (
              <Typography variant='h5'>No Officers Currently Availible</Typography>
            )}
          </Box>
        )}
      </Paper>
      <Paper sx={{ position: 'relative' }}>
        <SearchToolbar title='Active Roster' onSearchChange={setActiveSearchTerm} />
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
            {activeSearchTerm ? (
              <Typography variant='h5'>No Matches Found</Typography>
            ) : (
              <Typography variant='h5'>No Members Currently Availible</Typography>
            )}
          </Box>
        )}
      </Paper>
      {!!prospects.length && (
        <Paper sx={{ position: 'relative' }}>
          <Toolbar sx={{ bgcolor: (theme) => theme.vars.palette.rosterHeader }}>
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
