import * as React from 'react'
import { FormControl, InputLabel, MenuItem, Select, type SelectProps } from '@mui/material'
import { OFFICER_POSITION } from '@/utils/constants'

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

export default function OfficeSelect({
  fullWidth,
  id = 'officier-select',
  variant,
  ...selectProps
}: SelectProps<OFFICER_POSITION>): JSX.Element {
  return (
    <FormControl fullWidth={fullWidth} variant={variant}>
      <InputLabel id={`${id}-label`} shrink>
        Office
      </InputLabel>
      <Select labelId={`${id}-label`} id={id} label='Office' notched displayEmpty {...selectProps}>
        <MenuItem value=''>None</MenuItem>
        {Offices.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
