'use client'

import React from 'react'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { CALENDAR_DRAWER_WIDTH, CALENDAR_VIEW } from '@/utils/constants'
import { signIn, useSession } from 'next-auth/react'
import CalendarDrawer from './Drawer'
import dayjs from 'dayjs'
import LeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import LoginIcon from '@mui/icons-material/Login'
import RightIcon from '@mui/icons-material/KeyboardArrowRight'
import { useCalendar } from '@/hooks/useCalendar'
import { startCase } from '@/utils/helpers'
import CalendarPicker from './CalendarPicker'

export default function CalendarDesktopHeader(): JSX.Element {
  const { status } = useSession()
  const { date, setDate, view } = useCalendar()
  const headerDateString = React.useMemo(() => {
    switch (view) {
      case CALENDAR_VIEW.DAY:
        return date.format('MMMM D, YYYY')
      case CALENDAR_VIEW.SCHEDULE: {
        const startOfSchedule = date.startOf('day')
        const endOfSchedule = date.add(2, 'months').endOf('day')

        return `${startOfSchedule.format('MMM YYYY')} - ${endOfSchedule.format('MMM YYYY')}`
      }
      case CALENDAR_VIEW.WEEK: {
        const startOfWeek = date.startOf('week')
        const endOfWeek = date.endOf('week')

        if (startOfWeek.month() !== endOfWeek.month()) {
          return `${startOfWeek.format('MMM YYYY')} - ${endOfWeek.format('MMM YYYY')}`
        }

        return startOfWeek.format('MMMM YYYY')
      }
      default:
        return date.format('MMMM YYYY')
    }
  }, [view, date])

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
            <Tooltip
              title={`Previous ${
                view !== CALENDAR_VIEW.SCHEDULE ? startCase(view) : startCase(CALENDAR_VIEW.DAY)
              }`}
            >
              <IconButton
                size='small'
                onClick={() => {
                  const duration = view === CALENDAR_VIEW.SCHEDULE ? CALENDAR_VIEW.DAY : view

                  setDate(date.subtract(1, duration).startOf('day'))
                }}
              >
                <LeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={`Next ${
                view !== CALENDAR_VIEW.SCHEDULE ? startCase(view) : startCase(CALENDAR_VIEW.DAY)
              }`}
            >
              <IconButton
                size='small'
                onClick={() => {
                  const duration = view === CALENDAR_VIEW.SCHEDULE ? CALENDAR_VIEW.DAY : view
                  setDate(date.add(1, duration).startOf('day'))
                }}
              >
                <RightIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant='h5' sx={{ flex: 1 }}>
            {headerDateString}
          </Typography>
          <CalendarPicker />
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
