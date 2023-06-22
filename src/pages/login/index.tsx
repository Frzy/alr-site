import LoginForm from '@/component/login.form'
import { Box, Container, Paper, Typography } from '@mui/material'

import Image from 'next/image'

export default function LoginPage() {
  return (
    <Container maxWidth='sm'>
      <Box
        height='100vh'
        width='100%'
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexDirection='column'
      >
        <Paper sx={{ p: 2, width: '100%' }} elevation={8}>
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
      </Box>
    </Container>
  )
}
