'use client'

import Box from '@mui/material/Box'
import OfficerList from '../OfficerList'
import type { Member } from '@/types/common'

interface HomeViewProps {
  officers: Member[]
}

export default function HomeView({ officers }: HomeViewProps): React.ReactNode {
  return (
    <Box sx={{ display: 'flex' }}>
      <OfficerList officers={officers} />
    </Box>
  )
}
