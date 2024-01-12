import * as React from 'react'
import { type ENTITY, ENTITY_OBJECT_ARRAY, ENTITY_OBJECT } from '@/utils/constants'
import { useTheme } from '@mui/material/styles'
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectProps,
  useMediaQuery,
} from '@mui/material'

interface EntitySelectProps extends SelectProps<ENTITY | ENTITY[]> {
  values?: ENTITY[]
}

export default function EntitySelect({
  fullWidth,
  id = 'entity-select',
  variant,
  values = [],
  ...selectProps
}: EntitySelectProps): JSX.Element {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

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
                      bgcolor: ENTITY_OBJECT[value].color.background,
                      color: ENTITY_OBJECT[value].color.text,
                    }}
                    label={isSmall ? ENTITY_OBJECT[value].short : ENTITY_OBJECT[value].label}
                    size='small'
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
          <MenuItem key={entity.value} value={entity.value}>
            {isSmall ? entity.short : entity.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
