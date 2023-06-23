import * as React from 'react'
import { Theme, useTheme } from '@mui/material/styles'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Typography,
} from '@mui/material'
import { OFFICER_POSITION } from '@/utils/constants'
import TextDisplay from './text.display'

interface OfficerDisplayProps extends SelectProps {
  editing?: boolean
  value?: OFFICER_POSITION
}

const Offices = [
  { value: OFFICER_POSITION.DIRECTOR, label: 'Director' },
  { value: OFFICER_POSITION.VICE_DIRECTOR, label: 'Vice Director' },
  { value: OFFICER_POSITION.JR_VICE, label: 'Junior Vice Director' },
  { value: OFFICER_POSITION.SECRETARY, label: 'Secretary' },
  { value: OFFICER_POSITION.TREASURER, label: 'Treasurer' },
  { value: OFFICER_POSITION.SGT_AT_ARMS, label: 'Sergent at Arms' },
  { value: OFFICER_POSITION.ROAD_CAPTAIN, label: 'Road Captain' },
  { value: OFFICER_POSITION.HISTORIAN, label: 'Historian' },
  { value: OFFICER_POSITION.CHAPLAIN, label: 'Chaplain' },
  { value: OFFICER_POSITION.PAST_DIRECTOR, label: 'Past Director' },
]

export default function OfficeDisplay({
  editing,
  value,
  fullWidth,
  size,
  ...selectProps
}: OfficerDisplayProps) {
  const theme = useTheme()
  const displayValue = React.useMemo(() => {
    const found = Offices.find((o) => o.value === value)

    return found ? found.label : 'No Office Held'
  }, [value])
  if (!editing) {
    return <TextDisplay label='Office' value={displayValue} fullWidth={fullWidth} size={size} />
  }

  return (
    <FormControl fullWidth={fullWidth} variant={editing ? 'outlined' : 'standard'}>
      <InputLabel id='officier-select-label'>Office</InputLabel>
      <Select
        labelId='officier-select-label'
        id='officier-select'
        label='Office'
        displayEmpty
        {...selectProps}
        value={value || ''}
        disableUnderline
        inputProps={{
          readOnly: !editing,
          disabled: !editing,
        }}
        sx={{
          ...selectProps.sx,
          '& .MuiSelect-icon': {
            opacity: !selectProps.disabled && !editing ? 0 : 1,
          },
          '& .Mui-disabled': {
            WebkitTextFillColor: (theme) => {
              if (!selectProps.disabled && !editing) return theme.palette.text.primary

              return theme.palette.text.disabled
            },
          },
        }}
      >
        <MenuItem value=''>No Office Held</MenuItem>
        {Offices.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
