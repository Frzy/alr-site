import * as React from 'react'
import {
  ENTITY,
  ENTITY_OBJECTS,
  ENTITY_COLORS,
  ENTITY_OBJECT_ARRAY,
  ENTITY_OBJECT,
} from '@/utils/constants'
import { Theme, useTheme } from '@mui/material/styles'
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  useMediaQuery,
} from '@mui/material'

interface EntityDisplayProps extends SelectProps<ENTITY | ENTITY[]> {
  editing?: boolean
  values?: ENTITY[]
}

export default function EntityDisplay({
  fullWidth,
  id = 'entity-select',
  variant,
  values = [],
  ...selectProps
}: EntityDisplayProps): JSX.Element {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`} shrink>
        {values.length > 1 ? 'Entities' : 'Entity'}
      </InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        name='entity'
        multiple
        value={values}
        renderValue={(selected) => {
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as ENTITY[]).map((value) => {
                return (
                  <Chip
                    key={value}
                    sx={{
                      bgcolor: ENTITY_COLORS[value].background,
                      color: ENTITY_COLORS[value].text,
                    }}
                    label={isSmall ? ENTITY_OBJECT[value].short : ENTITY_OBJECT[value].label}
                  />
                )
              })}
            </Box>
          )
        }}
        {...selectProps}
        label={values.length > 1 ? 'Entities' : 'Entity'}
      >
        {ENTITY_OBJECT_ARRAY.map((entity) => (
          <MenuItem
            key={entity.value}
            value={entity.value}
            style={getStyles(entity.value, values, theme)}
          >
            {isSmall ? entity.value : entity.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
