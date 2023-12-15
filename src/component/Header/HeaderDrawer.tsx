'use client'

import * as React from 'react'
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  useColorScheme,
} from '@mui/material'
import { signIn, signOut, useSession } from 'next-auth/react'
import InboxIcon from '@mui/icons-material/MoveToInbox'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MailIcon from '@mui/icons-material/Mail'
import PersonIcon from '@mui/icons-material/Person'
import type { Mode } from '@/types/common'

export default function HeaderDrawer(): React.ReactNode {
  const { data, status } = useSession()
  const { mode, setMode } = useColorScheme()
  const user = data?.user

  return (
    <div>
      <Toolbar />
      {status === 'unauthenticated' && (
        <React.Fragment>
          <Divider />
          <List>
            <ListItemButton
              onClick={() => {
                void signIn()
              }}
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary='Login' />
            </ListItemButton>
          </List>
        </React.Fragment>
      )}
      {status === 'authenticated' && user && (
        <React.Fragment>
          <Divider />
          <List>
            <ListItem>
              <ListItemIcon>
                <Avatar src={user.image} alt={user.name}></Avatar>
              </ListItemIcon>
              <ListItemText primary={user.name} />
            </ListItem>
            <ListItemButton href={`/member/${user.id}`}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary='Profile' />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                void signOut()
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary='Logout' />
            </ListItemButton>
          </List>
        </React.Fragment>
      )}
      <Box sx={{ px: 1, pb: 1 }}>
        <Typography variant='subtitle2' color='text.secondary'>
          Theme
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={mode}
          onChange={(event, value: Mode) => {
            setMode(value)
          }}
          size='small'
          fullWidth
        >
          <ToggleButton value={'light'}>Light</ToggleButton>
          <ToggleButton value={'system'}>System</ToggleButton>
          <ToggleButton value={'dark'}>Dark</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  )
}
