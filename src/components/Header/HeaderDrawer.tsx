'use client'

import * as React from 'react'
import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { signIn, signOut, useSession } from 'next-auth/react'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import CalendarIcon from '@mui/icons-material/CalendarToday'

export default function HeaderDrawer(): React.ReactNode {
  const { data: session, status } = useSession()
  const user = session?.user

  return (
    <div>
      <Toolbar />
      {status === 'unauthenticated' && (
        <React.Fragment>
          <Divider />
          <List disablePadding>
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
      {user && (
        <React.Fragment>
          <Divider />
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <Avatar src={user.image} alt={user.name}></Avatar>
              </ListItemIcon>
              <ListItemText primary={user.name} />
            </ListItem>
            <ListItemButton href='/profile'>
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
      <Divider />
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton href='/calendar/month'>
            <ListItemIcon>
              <CalendarIcon />
            </ListItemIcon>
            <ListItemText primary={'Calendar'} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href='/calendar/month'>
            <ListItemIcon>
              <CalendarIcon />
            </ListItemIcon>
            <ListItemText primary={'Add Log Entry'} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
    </div>
  )
}
