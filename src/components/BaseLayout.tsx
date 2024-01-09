import React from 'react'
import Header from './Header/Header'
import { Box, Container } from '@mui/material'
import { DRAWER_WIDTH, HEADER_MAX_HEIGHT } from '@/utils/constants'

export default function BaseLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <React.Fragment>
      <Header />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          mt: { xs: '64px', sm: '72px', md: `${HEADER_MAX_HEIGHT + 24}px` },
          pb: 2,
          position: 'relative',
        }}
      >
        <Container maxWidth='xl'>{children}</Container>
      </Box>
    </React.Fragment>
  )
}
