'use client'

import LoginForm from '@/component/login.form'
import { Box, Container, Paper, Typography } from '@mui/material'

import Image from 'next/image'
import React from 'react'

export default function LoginView(): React.ReactNode {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        backgroundColor: (theme) => theme.vars.palette.background.default,
      }}
    >
      <Container
        maxWidth='xs'
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        <Paper sx={{ p: 2 }} elevation={8}>
          <Box position='relative' width='100%'>
            <Typography variant='h3' align='center' gutterBottom>
              ALR 91 Login
            </Typography>
            <Image
              alt='login banner'
              src='/images/bike-flag-banner.jpg'
              width={0}
              height={0}
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
              priority
            />
          </Box>
          <LoginForm mt={1} />
        </Paper>
      </Container>
    </Box>
  )
}
