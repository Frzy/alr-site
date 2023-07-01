import * as React from 'react'
import { ROLE, ROLES } from '@/utils/constants'
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

interface TextDisplayProps extends SelectProps<ROLE> {
  editing?: boolean
  value?: ROLE
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export default function RoleDisplay({ editing, fullWidth, ...selectProps }: TextDisplayProps) {
  const theme = useTheme()
  if (!editing) selectProps.disableUnderline = true

  return (
    <FormControl fullWidth={fullWidth} variant={editing ? 'outlined' : 'standard'}>
      <InputLabel id='role-select-label'>Status</InputLabel>
      <Select
        labelId='role-select-label'
        id='role-select'
        label='Status'
        {...selectProps}
        inputProps={{
          readOnly: !editing,
          disabled: !editing || selectProps.disabled,
        }}
        sx={{
          ...selectProps.sx,
          '& .MuiSelect-icon': {
            display: !selectProps.disabled && !editing ? 'none' : undefined,
          },
          '&.MuiInputBase-root .Mui-disabled': {
            WebkitTextFillColor: (theme) => {
              if (!selectProps.disabled && !editing) return theme.palette.text.primary

              return theme.palette.text.disabled
            },
          },
        }}
      >
        {ROLES.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
