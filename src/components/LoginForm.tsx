import * as React from 'react'
import { LoadingButton } from '@mui/lab'
import { Alert, Box, type BoxProps, Button, Stack, TextField } from '@mui/material'

import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function LoginForm(props: BoxProps): JSX.Element {
  const router = useRouter()
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [formValues, setFormValues] = React.useState({
    username: '',
    password: '',
  })
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const res = await signIn('credentials', {
        redirect: false,
        username: formValues.username,
        password: formValues.password,
        callbackUrl,
      })

      if (!res?.error) {
        router.push(callbackUrl)
      } else {
        throw new Error('Invalid Username or Password')
      }
    } catch (error) {
      setError(error as Error)
      setLoading(false)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target
    setFormValues({ ...formValues, [name]: value })
  }

  return (
    <Box {...props}>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {!!error && <Alert severity='error'>{error.message}</Alert>}
          <TextField
            required
            type='text'
            name='username'
            error={!!error}
            disabled={loading}
            value={formValues.username}
            onChange={handleChange}
            label='User Name'
            autoFocus
            fullWidth
          />
          <TextField
            required
            type='password'
            name='password'
            error={!!error}
            disabled={loading}
            value={formValues.password}
            onChange={handleChange}
            label='Password'
            fullWidth
          />
          <LoadingButton type='submit' loading={loading} variant='outlined'>
            Login
          </LoadingButton>
          <Button disabled={loading} href='/'>
            Cancel
          </Button>
        </Stack>
      </form>
    </Box>
  )
}
