import * as React from 'react'
import { Autocomplete, CircularProgress, TextField, TextFieldProps } from '@mui/material'
import { ENDPOINT } from '@/utils/constants'
import TextDisplay from './text.display'

interface ActiviyLogNamesProps extends Omit<TextFieldProps, 'variant'> {
  editing?: boolean
}

export default function ActiviyLogNames({
  editing,
  value = null,
  size,
  fullWidth,
}: ActiviyLogNamesProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<readonly string[]>([])
  const loading = open && options.length === 0

  React.useEffect(() => {
    let active = true

    if (!loading) {
      return undefined
    }

    ;(async () => {
      const response = await fetch(ENDPOINT.LOG_NAMES)
      const names = (await response.json()) as string[]

      if (active) {
        setOptions([...names])
      }
    })()

    return () => {
      active = false
    }
  }, [loading])

  if (!editing) {
    return <TextDisplay value={value} label='Activity Log Link' size={size} fullWidth={fullWidth} />
  }

  return (
    <Autocomplete
      open={open}
      value={value}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      // isOptionEqualToValue={(option, value) => option === value}
      // getOptionLabel={(option) => option}
      options={options}
      loading={loading}
      size={size}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label='Activity Log Link'
          size={size}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}
