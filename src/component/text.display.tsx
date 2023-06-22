import * as React from 'react'
import { Box, Divider, Paper, TextField, OutlinedTextFieldProps, Typography } from '@mui/material'

interface TextDisplayProps extends Omit<OutlinedTextFieldProps, 'value' | 'outlined'> {
  editing?: boolean
  value?: string
}

export default function TextDisplay({
  editing,
  label = '',
  value = '',
  fullWidth,
  size = 'small',
  ...textFieldProps
}: TextDisplayProps) {
  if (editing)
    return (
      <TextField
        label={label}
        value={value}
        size={size}
        fullWidth={fullWidth}
        {...textFieldProps}
      />
    )

  return (
    <Box
      component='span'
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
        display: fullWidth ? 'flex' : 'inline-block',
        alignItems: fullWidth ? 'center' : undefined,
      }}
    >
      <Box
        sx={{
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          px: 1.5,
          height: size === 'medium' ? 56 : 40,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'inline-block',
        }}
      >
        <Typography
          variant='subtitle2'
          fontSize='1.05rem'
          component='span'
          lineHeight={size === 'medium' ? '56px' : '40px'}
        >
          {label}
        </Typography>
      </Box>
      <Typography component='span' sx={{ minWidth: '182px', px: 1, display: 'inline-block' }}>
        {value}
      </Typography>
    </Box>
  )
}
