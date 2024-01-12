'use client'

import * as React from 'react'
import {
  Avatar,
  Box,
  Button,
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
import { StaticDatePicker } from '@mui/x-date-pickers'
import { type Dayjs } from 'dayjs'
import { useCalendar } from '@/hooks/useCalendar'
import AddIcon from '@mui/icons-material/Add'

export default function CalendarDrawer(): React.ReactNode {
  const { data: session, status } = useSession()
  const { date, setDate } = useCalendar()
  const user = session?.user

  function handleDateChange(value: Dayjs | null): void {
    if (value) {
      setDate(value)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Divider />
      <Box>
        <StaticDatePicker
          value={date}
          onChange={handleDateChange}
          slotProps={{
            toolbar: { hidden: true },
            actionBar: { style: { display: 'none' } },
          }}
        />
        <Box sx={{ px: 2, pb: 1 }}>
          <Button variant='outlined' startIcon={<AddIcon />} fullWidth>
            Create Event
          </Button>
        </Box>
      </Box>
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
      <Box sx={{ flex: 1 }} />
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
    </Box>
  )
}
