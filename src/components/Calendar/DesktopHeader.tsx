'use client'

import React from 'react'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { CALENDAR_DRAWER_WIDTH } from '@/utils/constants'
import { signIn, useSession } from 'next-auth/react'
import CalendarDrawer from './Drawer'
import dayjs from 'dayjs'
import DownArrow from '@mui/icons-material/ArrowDropDown'
import LeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import LoginIcon from '@mui/icons-material/Login'
import RightIcon from '@mui/icons-material/KeyboardArrowRight'
import { useCalendar } from '@/hooks/useCalendar'

export default function CalendarDesktopHeader(): JSX.Element {
  const { status } = useSession()
  const { date, setDate } = useCalendar()
  const [calendarTypeAnchorEl, setCalendarTypeAnchorEl] = React.useState<HTMLElement | null>(null)
  const openCalendarTypeMenu = Boolean(calendarTypeAnchorEl)

  function handleCalendarTypeClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setCalendarTypeAnchorEl(event.currentTarget)
  }
  function handleCalendarTypeClose(): void {
    setCalendarTypeAnchorEl(null)
  }

  return (
    <React.Fragment>
      <AppBar
        position='fixed'
        sx={{
          width: `calc(100% - ${CALENDAR_DRAWER_WIDTH}px)`,
          ml: `${CALENDAR_DRAWER_WIDTH}px`,
          mr: 0,
          mt: 0,
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Tooltip title={dayjs().format('dddd, MMMM DD')}>
            <Button
              variant='outlined'
              color='inherit'
              onClick={() => {
                setDate(dayjs())
              }}
            >
              Today
            </Button>
          </Tooltip>
          <Box>
            <Tooltip title='Previous Month'>
              <IconButton
                size='small'
                onClick={() => {
                  setDate(date.subtract(1, 'month').startOf('month'))
                }}
              >
                <LeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Next Month'>
              <IconButton
                size='small'
                onClick={() => {
                  setDate(date.add(1, 'month').startOf('month'))
                }}
              >
                <RightIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant='h5' sx={{ flex: 1 }}>
            {date.format('MMMM YYYY')}
          </Typography>
          <Button
            variant='outlined'
            color='inherit'
            endIcon={<DownArrow />}
            onClick={handleCalendarTypeClick}
          >
            Month
          </Button>
          <Menu
            id='basic-menu'
            anchorEl={calendarTypeAnchorEl}
            open={openCalendarTypeMenu}
            onClose={handleCalendarTypeClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={handleCalendarTypeClose}>Day</MenuItem>
            <MenuItem onClick={handleCalendarTypeClose}>Week</MenuItem>
            <MenuItem onClick={handleCalendarTypeClose} selected>
              Month
            </MenuItem>
            <MenuItem onClick={handleCalendarTypeClose}>Schedule</MenuItem>
          </Menu>
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

      <Box
        component='nav'
        sx={{ width: CALENDAR_DRAWER_WIDTH, flexShrink: 0 }}
        aria-label='mailbox folders'
      >
        <Drawer
          variant='permanent'
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: CALENDAR_DRAWER_WIDTH },
          }}
          open
        >
          <CalendarDrawer />
        </Drawer>
      </Box>
    </React.Fragment>
  )
}
