'use client'

import * as React from 'react'
import { Hidden } from '@mui/material'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'
import { usePathname } from 'next/navigation'

function getTitle(path: string): string {
  switch (path) {
    case '/':
      return 'ALR 91 Portal'
    case '/activity-log/form':
      return 'Activity Log Entry Form'
    default:
      return ''
  }
}

export default function Header(): React.JSX.Element | null {
  const currentPage = usePathname()
  const title = getTitle(currentPage)

  return (
    <React.Fragment>
      <Hidden mdDown>
        <DesktopHeader title={title} disableShrink={currentPage === '/calendar'} />
      </Hidden>
      <Hidden mdUp>
        <MobileHeader title={title} />
      </Hidden>
    </React.Fragment>
  )
}
