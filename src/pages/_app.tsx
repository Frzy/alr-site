import * as React from 'react'
import type { AppProps } from 'next/app'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { SessionProvider } from 'next-auth/react'
import type {} from '@mui/material/themeCssVarsAugmentation'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import theme from '@/utils/theme'
import createEmotionCache from '@/utils/createEmotionCache'
import { Session, getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GetServerSideProps } from 'next'

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

const MyApp: React.FunctionComponent<MyAppProps> = ({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <CacheProvider value={emotionCache}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </CssVarsProvider>
    </CacheProvider>
  )
}

export const getServerSideProps: GetServerSideProps<{
  session: Session | null
}> = async (contex) => {
  const { req, res } = contex
  return { props: { session: await getServerSession(req, res, authOptions) } }
}

export default MyApp
