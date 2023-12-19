import React from 'react'
import { DRAWER_WIDTH, HEADER_MAX_HEIGHT } from '@/utils/constants'
import Box from '@mui/material/Box'
import CalendarHeader from '../Calendar/Header'

export default function CalendarView(): React.ReactNode {
  return (
    <React.Fragment>
      <CalendarHeader />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          mt: { xs: '64px', sm: '72px', md: `${HEADER_MAX_HEIGHT + 24}px` },
          pb: 2,
          position: 'relative',
          bgcolor: 'blue',
        }}
      >
        <div>Calendar</div>
      </Box>
    </React.Fragment>
  )
}
