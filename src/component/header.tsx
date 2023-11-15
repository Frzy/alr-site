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
import Link from './link'

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
            <Link href='/'>
              <Avatar
                alt='American Legion Riders Logo'
                src='/images/alr-logo.png'
                sx={{ width: 'auto', height: 64 }}
              />
            </Link>
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                alignItems: 'center',
              }}
            >
              <Hidden mdDown>
                <Link href='/' color='inherit' underline='none'>
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
                </Link>
              </Hidden>
              <Hidden mdUp>
                <Link href='/'>
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
                </Link>
              </Hidden>
              <Box display='flex' columnGap={1}>
                <Button
                  disabled={pathname === '/'}
                  href='/'
                  color='inherit'
                  onClick={handleCloseNavMenu}
                  size='small'
                >
                  Home
                </Button>
                <Button
                  disabled={pathname === '/roster'}
                  href='/roster'
                  color='inherit'
                  onClick={handleCloseNavMenu}
                  size='small'
                >
                  Roster
                </Button>
                <Button
                  disabled={pathname === '/events'}
                  href='/events'
                  color='inherit'
                  onClick={handleCloseNavMenu}
                  size='small'
                >
                  Events
                </Button>
                <Button
                  disabled={pathname === '/stats'}
                  href='/stats'
                  color='inherit'
                  onClick={handleCloseNavMenu}
                  size='small'
                >
                  Stats
                </Button>
                <Button
                  disabled={pathname === '/documents'}
                  href='/documents'
                  color='inherit'
                  onClick={handleCloseNavMenu}
                  size='small'
                >
                  Documents
                </Button>
                <Button
                  disabled={pathname === '/log'}
                  href='/log'
                  color='inherit'
                  onClick={handleCloseNavMenu}
                  size='small'
                >
                  Activity Log
                </Button>
                {!!session?.user.office && (
                  <Button
                    disabled={pathname === '/admin'}
                    href='/admin'
                    color='inherit'
                    onClick={handleCloseNavMenu}
                    size='small'
                  >
                    Admin
                  </Button>
                )}
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
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu()
                      window.location.href = `/member/${session.user.id}`
                    }}
                  >
                    <Typography textAlign='center'>Profile</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setMode(mode === 'light' ? 'dark' : 'light')
                      handleCloseUserMenu()
                    }}
                  >
                    <Typography textAlign='center'>
                      {mode === 'light' ? 'Use Dark Theme' : 'Use Light Theme'}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      signOut()
                      handleCloseUserMenu()
                    }}
                  >
                    <Typography textAlign='center'>Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box display='flex' justifyContent='right' width={100}>
                <Button onClick={() => signIn()}>Login</Button>
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
                  <Link href='/'>
                    <Typography textAlign='center'>Home</Typography>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href='/roster'>
                    <Typography textAlign='center'>Roster</Typography>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href='/events'>
                    <Typography textAlign='center'>Events</Typography>
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link href='/stats'>
                    <Typography textAlign='center'>Stats</Typography>
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link href='/documents'>
                    <Typography textAlign='center'>Documents</Typography>
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link href='/log'>
                    <Typography textAlign='center'>Activity Log</Typography>
                  </Link>
                </MenuItem>
                {!!session?.user.office && (
                  <MenuItem onClick={handleCloseNavMenu}>
                    <Link href='/admin'>
                      <Typography textAlign='center'>Admin</Typography>
                    </Link>
                  </MenuItem>
                )}
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
                  <MenuItem
                    onClick={() => {
                      setMode(mode === 'light' ? 'dark' : 'light')
                      handleCloseUserMenu()
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
