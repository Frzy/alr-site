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
import InboxIcon from '@mui/icons-material/MoveToInbox'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MailIcon from '@mui/icons-material/Mail'
import PersonIcon from '@mui/icons-material/Person'
import CalendarIcon from '@mui/icons-material/CalendarToday'

export default function HeaderDrawer(): React.ReactNode {
  const { data, status } = useSession()
  const user = data?.user

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
      {status === 'authenticated' && user && (
        <React.Fragment>
          <Divider />
          <List disablePadding>
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
      <Divider />
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton href='/calendar'>
            <ListItemIcon>
              <CalendarIcon />
            </ListItemIcon>
            <ListItemText primary={'Calendar'} />
          </ListItemButton>
        </ListItem>
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
