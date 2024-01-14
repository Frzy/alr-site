'use client'

import * as React from 'react'
import { DRAWER_WIDTH, HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT } from '@/utils/constants'
import { signIn, useSession } from 'next-auth/react'
import HeaderDrawer from './HeaderDrawer'
import LoginIcon from '@mui/icons-material/Login'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  type Theme,
} from '@mui/material'

const HEADER_PADDING = 16

export default function DesktopHeader({
  title = '',
  disableAnimation = false,
}: {
  title: React.ReactNode
  disableAnimation?: boolean
}): React.ReactNode {
  const { status } = useSession()
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const [shrink, setShrink] = React.useState(disableAnimation)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)

  function handleDrawerClose(): void {
    setIsClosing(true)
    setMobileOpen(false)
  }

  function handleDrawerTransitionEnd(): void {
    setIsClosing(false)
  }

  function handleDrawerToggle(): void {
    if (!isClosing) {
      setMobileOpen(!mobileOpen)
    }
  }

  React.useEffect(() => {
    if (isSmall) {
      setMobileOpen(false)
      setIsClosing(false)
    }
  }, [isSmall])

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

    if (!disableAnimation) {
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [disableAnimation])

  return (
    <React.Fragment>
      <AppBar
        position='fixed'
        sx={{
          width: {
            xs: `calc(100% - ${shrink || disableAnimation ? 0 : HEADER_PADDING * 2}px)`,
            md: `calc(100% - ${
              DRAWER_WIDTH + (shrink || disableAnimation ? 0 : HEADER_PADDING * 2)
            }px)`,
          },
          ml: { xs: 0, md: DRAWER_WIDTH },
          mr: shrink || disableAnimation ? 0 : `${HEADER_PADDING}px`,
          mt: shrink || disableAnimation ? 0 : `${HEADER_PADDING}px`,
          borderRadius: shrink || disableAnimation ? 0 : 2,
          transition: (theme) =>
            theme.transitions.create(['all'], { duration: theme.transitions.duration.shortest }),
        }}
      >
        <Toolbar
          sx={
            isSmall
              ? {
                  transition: (theme) =>
                    theme.transitions.create(['all'], {
                      duration: theme.transitions.duration.shortest,
                    }),
                  minHeight: {
                    md: shrink || disableAnimation ? HEADER_MIN_HEIGHT : HEADER_MAX_HEIGHT,
                  },
                }
              : undefined
          }
        >
          {isSmall && (
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: { xs: 0.5, md: 2 } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {React.isValidElement(title) ? (
            title
          ) : (
            <Typography
              variant={shrink || disableAnimation ? 'h6' : 'h4'}
              sx={{ fontSize: { xs: '1.25rem', md: '1.7rem' }, flex: 1 }}
              noWrap
              component='h1'
            >
              {title}
            </Typography>
          )}
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
          variant={isSmall ? 'temporary' : 'permanent'}
          open={isSmall ? mobileOpen : true}
          onTransitionEnd={isSmall ? handleDrawerTransitionEnd : undefined}
          onClose={isSmall ? handleDrawerClose : undefined}
          ModalProps={
            isSmall
              ? {
                  keepMounted: true,
                }
              : undefined
          }
          sx={{
            display: { xs: isSmall ? 'block' : 'none', md: !isSmall ? 'block' : 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <HeaderDrawer />
        </Drawer>
      </Box>
    </React.Fragment>
  )
}
