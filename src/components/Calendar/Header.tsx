'use client'

import React from 'react'
import { AppBar, Box, Button, Drawer, Toolbar, Typography } from '@mui/material'
import { DRAWER_WIDTH, HEADER_MIN_HEIGHT } from '@/utils/constants'
import { signIn, useSession } from 'next-auth/react'
import LoginIcon from '@mui/icons-material/Login'
import HeaderDrawer from '../Header/HeaderDrawer'

export default function CalendarHeader(): JSX.Element {
  const { status } = useSession()

  return (
    <React.Fragment>
      <AppBar
        position='fixed'
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          mr: 0,
          mt: 0,
          borderRadius: 0,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { md: HEADER_MIN_HEIGHT },
          }}
        >
          <Typography variant={'h6'} noWrap component='div' sx={{ flex: 1 }}>
            Calendar
          </Typography>
          {status === 'unauthenticated' && (
            <Button
              onClick={() => {
                void signIn()
              }}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component='nav' sx={{ width: DRAWER_WIDTH, flexShrink: 0 }} aria-label='mailbox folders'>
        <Drawer
          variant='permanent'
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          <HeaderDrawer />
        </Drawer>
      </Box>
    </React.Fragment>
  )
}
