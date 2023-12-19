import * as React from 'react'
import { COLOR_OPTIONS, DEFAULT_CALENDAR_COLOR_ID, EVENT_TYPE_COLOR_ID } from '@/utils/constants'
import { Box, FormControl, MenuItem, Select, SelectProps } from '@mui/material'

export default function CalendarColorPicker({ value, ...selectProps }: SelectProps) {
  const colors = React.useMemo(() => {
    const toExclude: string[] = []

    for (const [key, value] of Object.entries(EVENT_TYPE_COLOR_ID)) {
      if (key !== 'EVENT') toExclude.push(value)
    }

    return COLOR_OPTIONS.filter((opt) => {
      return toExclude.indexOf(opt.value) === -1
    })
  }, [])

  return (
    <FormControl sx={{ width: 100 }}>
      <Select displayEmpty size='small' value={value || DEFAULT_CALENDAR_COLOR_ID} {...selectProps}>
        {colors.map((opt) => (
          <MenuItem
            key={opt.value}
            value={opt.value}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: opt.color }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
