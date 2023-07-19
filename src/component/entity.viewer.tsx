import * as React from 'react'
import { ENTITY, ENTITY_OBJECTS, ENTITY_COLORS } from '@/utils/constants'
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

function getStyles(name: ENTITY, values: readonly ENTITY[], theme: Theme) {
  return {
    fontWeight:
      values.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  }
}

export default function EntityDisplay({
  editing,
  values = [],
  fullWidth,
  size = 'small',
  ...selectProps
}: EntityDisplayProps) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  if (!editing) selectProps.disableUnderline = true

  return (
    <FormControl fullWidth>
      <InputLabel id='entity-select-label' sx={{ left: editing ? undefined : -15 }}>
        {values.length > 1 ? 'Entities' : 'Entity'}
      </InputLabel>
      <Select
        labelId='entity-select-label'
        id='entity-select'
        name='entity'
        multiple
        value={values}
        inputProps={{
          readOnly: !editing,
          disabled: !editing || selectProps.disabled,
        }}
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
                    label={isSmall ? value : ENTITY_OBJECTS.find((e) => e.value === value)?.label}
                    size={size}
                  />
                )
              })}
            </Box>
          )
        }}
        MenuProps={MenuProps}
        {...selectProps}
        size='small'
        label={values.length > 1 ? 'Entities' : 'Entity'}
        variant={editing ? 'outlined' : 'standard'}
        sx={{
          ...selectProps.sx,
          '& .MuiSelect-icon': {
            display: !selectProps.disabled && !editing ? 'none' : undefined,
          },
          '&.MuiInputBase-root .Mui-disabled': {
            WebkitTextFillColor: (theme) => {
              if (!selectProps.disabled && !editing) return '#FFF'

              return theme.vars.palette.text.disabled
            },
          },
        }}
      >
        {ENTITY_OBJECTS.map((entity) => (
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
