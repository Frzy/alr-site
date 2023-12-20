'use client'

import React from 'react'
import { AppBar, Box, Button, Drawer, IconButton, Toolbar, Typography } from '@mui/material'
import { CALENDAR_DRAWER_WIDTH } from '@/utils/constants'
import { signIn, useSession } from 'next-auth/react'
import LoginIcon from '@mui/icons-material/Login'
import MenuIcon from '@mui/icons-material/Menu'
import CalendarDrawer from './Drawer'

export default function CalendarMobileHeader(): JSX.Element {
  const { status } = useSession()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  function handleDrawerToggle(): void {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <React.Fragment>
      <AppBar
        position='fixed'
        sx={{
          width: '100%',
          ml: 0,
          mr: 0,
          mt: 0,
          borderRadius: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

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

      <Box
        component='nav'
        sx={{ width: CALENDAR_DRAWER_WIDTH, flexShrink: 0 }}
        aria-label='mailbox folders'
      >
        <Drawer
          variant='temporary'
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: CALENDAR_DRAWER_WIDTH },
          }}
        >
          <CalendarDrawer />
        </Drawer>
      </Box>
    </React.Fragment>
  )
}
