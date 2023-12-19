import * as React from 'react'
import { useSession } from 'next-auth/react'
import { signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useColorScheme } from '@mui/material/styles'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Link as MuiLink,
  List,
  ListItem,
  ListSubheader,
  Toolbar,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import Link from '@/component/link'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

interface Props {
  children: React.ReactElement
}

const DRAWER_WIDTH = 240
const HEADER_HEIGHT = 104

export default function Header() {
  const { status, data: session } = useSession()
  const [isAdmin, setIsAdmin] = React.useState(false)
  const { mode, setMode } = useColorScheme()
  const [activityLogMenuAnchor, setActivityLogMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [adminMenuAnchor, setAdminMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const activityLogOpen = Boolean(activityLogMenuAnchor)
  const adminOpen = Boolean(adminMenuAnchor)
  const profileOpen = Boolean(profileMenuAnchor)

  function handleActivityMenuOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setActivityLogMenuAnchor(event.currentTarget)
  }
  function handleActivityMenuClose() {
    setActivityLogMenuAnchor(null)
  }
  function handleAdminMenuOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setAdminMenuAnchor(event.currentTarget)
  }
  function handleAdminMenuClose() {
    setAdminMenuAnchor(null)
  }
  function handleProfileMenuOpen(event: React.MouseEvent<HTMLButtonElement>) {
    setProfileMenuAnchor(event.currentTarget)
  }
  function handleProfileMenuClose() {
    setProfileMenuAnchor(null)
  }
  function handleDrawerToggle() {
    setDrawerOpen(!drawerOpen)
  }
  function handleThemeChange(
    event: React.MouseEvent<HTMLElement>,
    newMode: 'light' | 'dark' | 'system',
  ) {
    setMode(newMode)
    event.stopPropagation()
  }

  React.useEffect(() => {
    setIsAdmin(!!session?.user.office)
  }, [session])

  return (
    <React.Fragment>
      <Box
        sx={{
          bgcolor: (theme) => theme.vars.palette.background.default,
          height: { xs: 56, lg: (theme) => theme.gap(1) + HEADER_HEIGHT },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.vars.zIndex.appBar,
        }}
      >
        <AppBar
          sx={{
            m: { xs: undefined, lg: 1 },
            left: { xs: undefined, lg: 0 },
            width: (theme) => ({ xs: undefined, lg: `calc(100% - ${theme.spacing(2)})` }),
            borderRadius: { xs: undefined, lg: 4 },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: undefined, lg: HEADER_HEIGHT }, px: { xs: 1, lg: 2 } }}>
            <Link href='/' sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Avatar
                alt='American Legion Riders Logo'
                src='/images/alr-logo.png'
                sx={{ width: 'auto', height: 96 }}
              />
            </Link>
            <IconButton
              sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Box
              display='flex'
              flexDirection='column'
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                px: 1,
              }}
            >
              <Typography
                sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
                variant='h4'
                component='h1'
                gutterBottom
              >
                American Legion Riders Chapter 91 Portal
              </Typography>
              <Typography
                sx={{ display: { xs: 'inline-flex', lg: 'none' }, fontSize: '1.75rem' }}
                variant='h4'
                component='h1'
              >
                ALR 91 Portal
              </Typography>
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  width: 'fit-content',
                  '& hr': {
                    mx: 0.5,
                  },
                  columnGap: 4,
                }}
              >
                <Button sx={{ color: 'headerLink' }} href='/'>
                  Home
                </Button>
                <Divider orientation='vertical' flexItem />
                <Button
                  aria-controls={activityLogOpen ? 'activity-log-menu' : undefined}
                  aria-haspopup='true'
                  aria-expanded={activityLogOpen ? 'true' : undefined}
                  className={activityLogOpen ? 'open' : undefined}
                  id='activity-log-menu-button'
                  sx={{
                    color: 'headerLink',
                    '& .MuiButton-endIcon': {
                      marginLeft: 0.5,
                      marginTop: -0.5,
                      transition: (theme) =>
                        theme.transitions.create(['transform'], {
                          duration: theme.transitions.duration.standard,
                        }),
                    },
                    '&.open .MuiButton-endIcon': {
                      transform: 'rotate(-180deg)',
                    },
                  }}
                  onClick={handleActivityMenuOpen}
                  endIcon={<ExpandMoreIcon />}
                >
                  Activity Log
                </Button>
                <Button sx={{ color: 'headerLink' }} href='/calendar'>
                  Calendar
                </Button>
                <Button sx={{ color: 'headerLink' }} href='/documents'>
                  Documents
                </Button>
                <Button sx={{ color: 'headerLink' }} href='/roster'>
                  Roster
                </Button>
                {isAdmin && (
                  <React.Fragment>
                    <Divider orientation='vertical' flexItem />
                    <Button
                      aria-controls={adminOpen ? 'admin-menu' : undefined}
                      aria-haspopup='true'
                      aria-expanded={adminOpen ? 'true' : undefined}
                      className={adminOpen ? 'open' : undefined}
                      id='admin-menu-button'
                      sx={{
                        color: 'headerLink',
                        '& .MuiButton-endIcon': {
                          marginLeft: 0.5,
                          marginTop: -0.5,
                          transition: (theme) =>
                            theme.transitions.create(['transform'], {
                              duration: theme.transitions.duration.standard,
                            }),
                        },
                        '&.open .MuiButton-endIcon': {
                          transform: 'rotate(-180deg)',
                        },
                      }}
                      onClick={handleAdminMenuOpen}
                      endIcon={<ExpandMoreIcon />}
                    >
                      Admin
                    </Button>
                  </React.Fragment>
                )}
              </Box>
            </Box>
            <Box>
              {status === 'unauthenticated' && (
                <Button sx={{ color: 'headerLink' }} onClick={() => signIn()}>
                  Login
                </Button>
              )}
              {status === 'authenticated' && (
                <React.Fragment>
                  <Button
                    aria-controls={profileOpen ? 'profile-menu' : undefined}
                    aria-haspopup='true'
                    aria-expanded={profileOpen ? 'true' : undefined}
                    className={profileOpen ? 'open' : undefined}
                    id='profile-menu-button'
                    startIcon={<Avatar src={session.user.image} alt={session.user.name} />}
                    endIcon={<ExpandMoreIcon />}
                    onClick={handleProfileMenuOpen}
                    sx={{
                      color: 'headerLink',
                      display: { xs: 'none', lg: 'inline-flex' },
                      '& .MuiButton-endIcon': {
                        marginTop: -0.5,
                        transition: (theme) =>
                          theme.transitions.create(['transform'], {
                            duration: theme.transitions.duration.standard,
                          }),
                      },
                      '&.open .MuiButton-endIcon': {
                        transform: 'rotate(-180deg)',
                      },
                    }}
                  >
                    {session.user.name}
                  </Button>
                  <IconButton
                    sx={{ display: { sx: 'inline', lg: 'none' } }}
                    onClick={handleDrawerToggle}
                  >
                    <Avatar
                      src={session.user.image}
                      alt={session.user.name}
                      sx={{ width: 32, height: 32 }}
                    />
                  </IconButton>
                </React.Fragment>
              )}
            </Box>
          </Toolbar>
          <Menu
            id='activity-log-menu'
            anchorEl={activityLogMenuAnchor}
            open={activityLogOpen}
            onClose={handleActivityMenuClose}
            MenuListProps={{
              'aria-labelledby': 'activity-log-menu-button',
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.32))',
              },
            }}
          >
            <MenuItem href='/log/stats' component='a' onClick={handleActivityMenuClose}>
              Yearly Stats
            </MenuItem>
            <MenuItem href='/log/by-member' component='a' onClick={handleActivityMenuClose}>
              By Member
            </MenuItem>
            <Divider />
            <MenuItem href='/log/entry' component='a' onClick={handleActivityMenuClose}>
              Add Log Entry
            </MenuItem>
          </Menu>
          <Menu
            id='admin-menu'
            anchorEl={adminMenuAnchor}
            open={adminOpen}
            onClose={handleAdminMenuClose}
            MenuListProps={{
              'aria-labelledby': 'admin-menu-button',
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.32))',
              },
            }}
          >
            <MenuItem href='/admin/at-risk' component='a' onClick={handleAdminMenuClose}>
              At Risk Members
            </MenuItem>
            <MenuItem href='/admin/dues' component='a' onClick={handleAdminMenuClose}>
              Dues
            </MenuItem>
            <MenuItem href='/admin/email-lists' component='a' onClick={handleAdminMenuClose}>
              Email Lists
            </MenuItem>
            <MenuItem href='/admin/membership' component='a' onClick={handleAdminMenuClose}>
              Membership
            </MenuItem>
          </Menu>
          <Menu
            id='profile-menu'
            anchorEl={profileMenuAnchor}
            open={profileOpen}
            onClose={handleProfileMenuClose}
            MenuListProps={{
              'aria-labelledby': 'profile-menu-button',
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.32))',
              },
            }}
          >
            <MenuItem
              href={`/member/${session?.user.id}`}
              component='a'
              onClick={handleProfileMenuClose}
            >
              Profile
            </MenuItem>
            <MenuItem sx={{ gap: 2 }}>
              <Typography>Theme</Typography>
              <ToggleButtonGroup
                sx={{ flex: 1 }}
                color='primary'
                value={mode}
                exclusive
                onChange={handleThemeChange}
                aria-label='Theme'
                size='small'
              >
                <ToggleButton value='light'>Light</ToggleButton>
                <ToggleButton value='dark'>Dark</ToggleButton>
              </ToggleButtonGroup>
            </MenuItem>
            <MenuItem component='a' onClick={handleProfileMenuClose}>
              Add Log Entry
            </MenuItem>
            <Divider />
            <MenuItem
              component='a'
              onClick={() => {
                handleProfileMenuClose()
                signOut()
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </AppBar>
        <Drawer
          variant='temporary'
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          <Toolbar>
            <Typography variant='h5' sx={{ flex: 1 }}>
              Navigation
            </Typography>
            <IconButton sx={{ justifySelf: 'flex-end' }} onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          {status === 'authenticated' && (
            <React.Fragment>
              <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={session?.user.image}
                  alt={session?.user.name}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography>{session.user.name}</Typography>
              </Box>
              <Divider />
              <List>
                <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
                  <Link href={`/member/${session?.user.id}`} underline='hover'>
                    Profile
                  </Link>
                </ListItem>
                <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
                  <MuiLink underline='none' component='button' onClick={() => signOut()}>
                    Sign Out
                  </MuiLink>
                </ListItem>
                <ListItem
                  sx={{ pl: 3, gap: 2 }}
                  onClick={() => {
                    setMode(mode === 'light' ? 'dark' : 'light')
                    handleDrawerToggle()
                  }}
                >
                  <Typography color='primary'>Theme</Typography>
                  <ToggleButtonGroup
                    sx={{ flex: 1 }}
                    color='primary'
                    value={mode}
                    exclusive
                    onChange={handleThemeChange}
                    aria-label='Theme'
                    size='small'
                  >
                    <ToggleButton value='light'>Light</ToggleButton>
                    <ToggleButton value='dark'>Dark</ToggleButton>
                  </ToggleButtonGroup>
                </ListItem>
              </List>
            </React.Fragment>
          )}
          <Divider />
          <List>
            <ListItem onClick={handleDrawerToggle}>
              <Link href='/' underline='hover'>
                Home
              </Link>
            </ListItem>
            <ListItem onClick={handleDrawerToggle}>
              <Link underline='none' href='/calendar'>
                Calendar
              </Link>
            </ListItem>
            <ListItem onClick={handleDrawerToggle}>
              <Link underline='none' href='/documents'>
                Documents
              </Link>
            </ListItem>
            <ListItem onClick={handleDrawerToggle}>
              <Link underline='none' href='/roster'>
                Roster
              </Link>
            </ListItem>
            <ListSubheader
              sx={{ lineHeight: 3, backgroundColor: (theme) => theme.vars.palette.divider }}
            >
              Activity Log
            </ListSubheader>
            <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
              <Link underline='none' href='/log/stats'>
                Yearly Stats
              </Link>
            </ListItem>
            <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
              <Link underline='none' href='/log/by-member'>
                By Member
              </Link>
            </ListItem>
            <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
              <Link underline='none' href='/log/entry'>
                Add New Entry
              </Link>
            </ListItem>
            {!isAdmin && <Divider />}
            {isAdmin && (
              <React.Fragment>
                <ListSubheader
                  sx={{ lineHeight: 3, backgroundColor: (theme) => theme.vars.palette.divider }}
                >
                  Admin
                </ListSubheader>
                <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
                  <Link underline='none' href='/admin/at-risk'>
                    At Risk
                  </Link>
                </ListItem>
                <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
                  <Link underline='none' href='/admin/dues'>
                    Dues
                  </Link>
                </ListItem>
                <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
                  <Link underline='none' href='/admin/email-lists'>
                    E-Mail Lists
                  </Link>
                </ListItem>
                <ListItem sx={{ pl: 3 }} onClick={handleDrawerToggle}>
                  <Link underline='none' href='/admin/membership'>
                    Membership
                  </Link>
                </ListItem>
                <Divider />
              </React.Fragment>
            )}
          </List>
        </Drawer>
      </Box>
      <Toolbar sx={{ mb: { xs: 2, lg: 7 } }} />
    </React.Fragment>
  )
}
