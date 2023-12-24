import * as React from 'react'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import { NextAuthProvider } from '@/components/NextAuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang='en'>
      <body>
        <ThemeRegistry>
          <NextAuthProvider>{children}</NextAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
