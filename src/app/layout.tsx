'use client'

import * as React from 'react'
import Box from '@mui/material/Box'
import ThemeRegistry from '@/component/ThemeRegistry/ThemeRegistry'
import Header from '@/component/Header/Header'
import { Container, getInitColorSchemeScript } from '@mui/material'
import { DRAWER_WIDTH, HEADER_MAX_HEIGHT } from '@/utils/constants'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang='en'>
      <body>
        {getInitColorSchemeScript()}
        <ThemeRegistry>
          <SessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
            <Header />
            <Box
              component='main'
              sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
                mt: { xs: '64px', sm: '72px', md: `${HEADER_MAX_HEIGHT + 24}px` },
                pb: 2,
              }}
            >
              <Container maxWidth='xl'>{children}</Container>
            </Box>
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
