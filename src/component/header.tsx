import * as React from 'react'
import { useSession } from 'next-auth/react'
import { signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

import { useColorScheme } from '@mui/material/styles'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import { Hidden, Toolbar } from '@mui/material'

const pages = ['Products', 'Pricing', 'Blog']
const settings = ['Profile', 'Account', 'Dashboard', 'Logout']

export default function Header() {
  const { status, data: session } = useSession()
  const { mode, setMode } = useColorScheme()
  const pathname = usePathname()
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  if (pathname === '/login') return null

  return (
    <React.Fragment>
      <AppBar sx={{ px: 2 }}>
        <Hidden smDown>
          <Box display='flex' alignItems='center'>
            <Avatar
              alt='American Legion Riders Logo'
              src='/images/alr-logo.png'
              sx={{ width: 'auto', height: 64 }}
            />
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                alignItems: 'center',
              }}
            >
              <Hidden mdDown>
                <Typography
                  variant='h5'
                  sx={{
                    pl: 1,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  American Legion Riders 91
                </Typography>
              </Hidden>
              <Hidden mdUp>
                <Typography
                  variant='h5'
                  sx={{
                    pl: 1,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  ALR 91
                </Typography>
              </Hidden>
              <Box display='flex' columnGap={1}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', display: 'block' }}
                  disabled={pathname === '/'}
                  size='small'
                >
                  Home
                </Button>
                <Button
                  href='/roster'
                  onClick={handleCloseNavMenu}
                  size='small'
                  sx={{ color: 'white', display: 'block' }}
                >
                  Roster
                </Button>
                <Button
                  disabled={pathname === '/events'}
                  href='/events'
                  size='small'
                  sx={{ color: 'white', display: 'block' }}
                >
                  Events
                </Button>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', display: 'block' }}
                  size='small'
                >
                  Logs
                </Button>
              </Box>
            </Box>
            {status === 'loading' ? (
              <Box display='flex' justifyContent='right' width={100} />
            ) : status === 'authenticated' ? (
              <Box display='flex' justifyContent='right' width={100}>
                <Tooltip title='Open settings'>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    {session.user.image ? (
                      <Avatar alt={session.user.name} src={session.user.image} />
                    ) : (
                      <Avatar alt={session.user.name}>
                        {`${session.user.firstName[0]}${session.user.lastName[0]}`}
                      </Avatar>
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id='menu-appbar'
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => (window.location.href = `/member/${session.user.id}`)}>
                    <Typography textAlign='center'>Profile</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setMode(mode === 'light' ? 'dark' : 'light')
                    }}
                  >
                    <Typography textAlign='center'>
                      {mode === 'light' ? 'Use Dark Theme' : 'Use Light Theme'}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => signOut()}>
                    <Typography textAlign='center'>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box display='flex' justifyContent='right' width={100}>
                <Button color='inherit' onClick={() => signIn()}>
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Hidden>
        <Hidden smUp>
          <Box display='flex' alignItems='center'>
            <Box>
              <IconButton
                size='large'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleOpenNavMenu}
                color='inherit'
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id='menu-appbar'
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign='center'>Home</Typography>
                </MenuItem>
                <MenuItem href='/roster'>
                  <Typography textAlign='center'>Roster</Typography>
                </MenuItem>
                <MenuItem href='/events'>
                  <Typography textAlign='center'>Events</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign='center'>Logs</Typography>
                </MenuItem>
              </Menu>
            </Box>
            <Avatar
              alt='American Legion Riders Logo'
              src='/images/alr-logo.png'
              sx={{ width: 'auto', height: 64 }}
            />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                alignItems: 'center',
              }}
            >
              <Typography
                variant='h5'
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                ALR 91
              </Typography>
            </Box>
            {status === 'loading' ? (
              <Box display='flex' justifyContent='right' width={75} />
            ) : status === 'authenticated' ? (
              <Box display='flex' justifyContent='right' width={75}>
                <Tooltip title='Open settings'>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    {session.user.image ? (
                      <Avatar alt={session.user.name} src={session.user.image} />
                    ) : (
                      <Avatar alt={session.user.name}>
                        {`${session.user.firstName[0]}${session.user.lastName[0]}`}
                      </Avatar>
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id='menu-appbar'
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => (window.location.href = `/member/${session.user.id}`)}>
                    <Typography textAlign='center'>Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => signOut()}>
                    <Typography textAlign='center'>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box display='flex' justifyContent='right' width={75}>
                <Button onClick={() => signIn()}>Login</Button>
              </Box>
            )}
          </Box>
        </Hidden>
      </AppBar>
      <Toolbar sx={{ mb: { xs: 1, sm: 0 } }} />
    </React.Fragment>
  )
}
