import * as React from 'react'
import { Hidden } from '@mui/material'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'

export default function Header(): React.JSX.Element {
  return (
    <React.Fragment>
      <Hidden mdDown>
        <DesktopHeader />
      </Hidden>
      <Hidden mdUp>
        <MobileHeader />
      </Hidden>
    </React.Fragment>
  )
}
