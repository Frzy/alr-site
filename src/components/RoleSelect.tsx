import * as React from 'react'
import { type ROLE, ROLES } from '@/utils/constants'
import { FormControl, InputLabel, MenuItem, Select, type SelectProps } from '@mui/material'

export default function RoleSelect({
  fullWidth,
  variant,
  id = 'role-select',
  ...selectProps
}: SelectProps<ROLE>): JSX.Element {
  return (
    <FormControl fullWidth={fullWidth} variant={variant}>
      <InputLabel id={`${id}-label`}>Status</InputLabel>
      <Select labelId={`${id}-label`} id={id} label='Status' {...selectProps}>
        {ROLES.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
