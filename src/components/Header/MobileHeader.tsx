'use client'

import React from 'react'
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from '@mui/material'
import HeaderDrawer from './HeaderDrawer'
import MenuIcon from '@mui/icons-material/Menu'
import { DRAWER_WIDTH } from '@/utils/constants'

export default function MobileHeader({ title = '' }: { title: string }): React.ReactNode {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  function handleDrawerToggle(): void {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <React.Fragment>
      <AppBar position='fixed'>
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
          <Typography variant='h6' noWrap component='div'>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component='nav' sx={{ width: DRAWER_WIDTH, flexShrink: 0 }} aria-label='mailbox folders'>
        <Drawer
          variant='temporary'
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <HeaderDrawer />
        </Drawer>
      </Box>
    </React.Fragment>
  )
}
