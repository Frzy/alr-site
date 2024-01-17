'use client'

import type { ServerMember } from '@/types/common'
import MemberViewer from '../MemberList'
import { mapToClientMember } from '@/utils/member'
import BaseLayout from '../BaseLayout'
import { Box, Paper, Stack, Typography } from '@mui/material'
import { CANIDATE_ROLES, RIDER_ROLES, ROLE } from '@/utils/constants'
import React from 'react'

export default function RosterView({
  serverMembers = [],
}: {
  serverMembers: ServerMember[]
}): JSX.Element {
  const members = serverMembers.map(mapToClientMember)
  const counts = React.useMemo(() => {
    return serverMembers.reduce(
      (count, m) => {
        return {
          riders: count.riders + (RIDER_ROLES.includes(m.role) ? 1 : 0),
          supporters: count.supporters + (ROLE.SUPPORTER === m.role ? 1 : 0),
          canidates: count.canidates + (CANIDATE_ROLES.includes(m.role) ? 1 : 0),
        }
      },
      {
        riders: 0,
        supporters: 0,
        canidates: 0,
      },
    )
  }, [serverMembers])
  return (
    <BaseLayout title='ALR 91 Roster'>
      <Stack spacing={1}>
        <Paper>
          <Box>
            <Typography>Riders</Typography>
            <Typography>{counts.riders}</Typography>
          </Box>
          <Box>
            <Typography>Supporters</Typography>
            <Typography>{counts.supporters}</Typography>
          </Box>
          <Box>
            <Typography>Canidates</Typography>
            <Typography>{counts.canidates}</Typography>
          </Box>
        </Paper>
        <MemberViewer members={members} />
      </Stack>
    </BaseLayout>
  )
}
