import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'

type SearchProps = {
  value: string
  animate?: boolean
} & TextFieldProps

export default function SearchField({
  animate,
  value,
  onChange,
  sx,
  InputProps,
  ...props
}: SearchProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const showClear = !!value.length

  function handleClear(): void {
    const input = inputRef?.current?.querySelector('input')
    if (input) {
      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')

      if (descriptor) {
        descriptor.set?.call(input, '')
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }

  return (
    <TextField
      {...props}
      value={value}
      onChange={onChange}
      ref={inputRef}
      sx={{
        ...sx,
        ...(animate
          ? {
              '& .MuiInputBase-input': {
                transition: (theme) => theme.transitions.create('width'),
                minWidth: 55,
                width: !value ? 55 : 200,
                '&:focus': {
                  width: 200,
                },
              },
            }
          : undefined),
      }}
      InputProps={{
        ...InputProps,
        startAdornment: (
          <InputAdornment position='start'>
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment
            position='end'
            sx={{
              transition: (theme) =>
                theme.transitions.create('opacity', {
                  duration: theme.transitions.duration.shorter,
                }),
              opacity: showClear ? 1 : 0,
            }}
          >
            <IconButton size='small' onClick={handleClear}>
              <CloseIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}
