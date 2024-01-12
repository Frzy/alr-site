import * as React from 'react'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import { NextAuthProvider } from '@/components/NextAuthProvider'
import { getServerAuthSession } from '@/lib/auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<JSX.Element> {
  const session = await getServerAuthSession()

  return (
    <html lang='en'>
      <body>
        <ThemeRegistry>
          <NextAuthProvider session={session}>{children}</NextAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
