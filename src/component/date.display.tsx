import * as React from 'react'
import { Moment } from 'moment'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers'
import TextDisplay from './text.display'

interface DateDisplayProps extends DatePickerProps<Moment> {
  editing?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  value: Moment | null
}

export default function DateDisplay({
  editing,
  disabled,
  fullWidth,
  size = 'medium',
  value,
  label,
  ...datePickerProps
}: DateDisplayProps) {
  if (!editing) {
    return (
      <TextDisplay
        fullWidth={fullWidth}
        size={size}
        label={label}
        value={value ? value.format('MM/DD/YYYY') : ''}
      />
    )
  }

  return (
    <DatePicker
      {...datePickerProps}
      disabled={disabled || !editing}
      label={label}
      value={value}
      sx={{
        '& .MuiFormLabel-root.Mui-disabled': {
          color: (theme) => {
            if (!disabled && !editing) return theme.palette.text.secondary
            return theme.palette.text.disabled
          },
        },
        '& .MuiInputBase-root.Mui-disabled': {
          color: (theme) => {
            if (!disabled && !editing) return theme.palette.text.primary

            return theme.palette.text.disabled
          },
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: (theme) => {
            if (!disabled && !editing) return theme.palette.text.primary

            return theme.palette.text.disabled
          },
        },
        '& .Mui-disabled .MuiInputAdornment-root': {
          display: !disabled && !editing ? 'none' : undefined,
        },
      }}
      slotProps={{
        textField: {
          fullWidth,
          size,
        },
      }}
    />
  )
}
