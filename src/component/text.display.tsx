import * as React from 'react'
import { Box, Divider, Paper, TextField, Typography, TextFieldProps } from '@mui/material'

interface TextDisplayProps extends Omit<TextFieldProps, 'variant'> {
  editing?: boolean
}

export default function TextDisplay({
  editing,
  autoComplete,
  ...textFieldProps
}: TextDisplayProps) {
  return (
    <TextField
      {...textFieldProps}
      variant={editing ? 'outlined' : 'standard'}
      autoComplete={editing ? autoComplete : 'off'}
      inputProps={{
        ...textFieldProps.inputProps,
        readOnly: !editing,
        disabled: !editing,
      }}
      InputProps={{ ...textFieldProps.InputProps, disableUnderline: !editing }}
    />
  )
}
