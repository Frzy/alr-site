import React from 'react'
import Header from './Header/Header'
import { Box, Container } from '@mui/material'
import { DRAWER_WIDTH, HEADER_MAX_HEIGHT } from '@/utils/constants'
import Notifier from './Notifier'

export interface LayoutProps {
  title?: React.ReactNode
  children: React.ReactNode
}

export default function BaseLayout({ title, children }: LayoutProps): JSX.Element {
  return (
    <React.Fragment>
      <Header title={title} />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          mt: { xs: '80px', sm: '88px', md: `${HEADER_MAX_HEIGHT + 24}px` },
          pb: 2,
          position: 'relative',
          minWidth: 360,
        }}
      >
        <Container maxWidth='xl'>{children}</Container>
      </Box>
      <Notifier />
    </React.Fragment>
  )
}
