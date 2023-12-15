'use client'

import * as React from 'react'
import { AppBar, Box, Button, Drawer, Toolbar, Typography } from '@mui/material'
import { DRAWER_WIDTH, HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT } from '@/utils/constants'
import { signIn, useSession } from 'next-auth/react'
import HeaderDrawer from './HeaderDrawer'
import LoginIcon from '@mui/icons-material/Login'

const HEADER_PADDING = 16

export default function DesktopHeader(): React.ReactNode {
  const { status } = useSession()
  const [shrink, setShrink] = React.useState(false)

  React.useEffect(() => {
    let lastScrollPosition = 0
    let ticking = false

    function handleScroll(): void {
      lastScrollPosition = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShrink(lastScrollPosition > 75)
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <React.Fragment>
      <AppBar
        position='fixed'
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH + (shrink ? 0 : HEADER_PADDING * 2)}px)`,
          ml: `${DRAWER_WIDTH}px`,
          mr: shrink ? 0 : `${HEADER_PADDING}px`,
          mt: shrink ? 0 : `${HEADER_PADDING}px`,
          borderRadius: shrink ? 0 : 2,
          transition: (theme) =>
            theme.transitions.create(['all'], { duration: theme.transitions.duration.shortest }),
        }}
      >
        <Toolbar
          sx={{
            transition: (theme) =>
              theme.transitions.create(['all'], { duration: theme.transitions.duration.shortest }),
            minHeight: { md: shrink ? HEADER_MIN_HEIGHT : HEADER_MAX_HEIGHT },
          }}
        >
          <Typography variant='h6' noWrap component='div' sx={{ flex: 1 }}>
            Desktop Responsive Drawer
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
