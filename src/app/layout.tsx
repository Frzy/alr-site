'use client'

import * as React from 'react'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang='en'>
      <body>
        <ThemeRegistry>
          <SessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
            {children}
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
