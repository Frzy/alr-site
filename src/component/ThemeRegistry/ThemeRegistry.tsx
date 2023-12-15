'use client'
import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from './theme'

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <CssVarsProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}
