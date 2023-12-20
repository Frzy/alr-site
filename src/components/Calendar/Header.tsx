'use client'

import React from 'react'
import CalendarDesktopHeader from './DesktopHeader'
import { Hidden } from '@mui/material'
import CalendarMobileHeader from './MobileHeader'

export default function CalendarHeader(): JSX.Element {
  return (
    <React.Fragment>
      <Hidden mdDown>
        <CalendarDesktopHeader />
      </Hidden>
      <Hidden mdUp>
        <CalendarMobileHeader />
      </Hidden>
    </React.Fragment>
  )
}
