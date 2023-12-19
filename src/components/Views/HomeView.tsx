'use client'

import Box from '@mui/material/Box'
import MemberList, { OfficerListItem } from '../MemberList/List'
import type { Member } from '@/types/common'

interface HomeViewProps {
  officers: Member[]
}

export default function HomeView({ officers }: HomeViewProps): React.ReactNode {
  return (
    <Box sx={{ display: 'flex' }}>
      <MemberList
        members={officers}
        title='Executive Board'
        renderListItem={(props, key) => <OfficerListItem key={key} {...props} />}
      />
    </Box>
  )
}
