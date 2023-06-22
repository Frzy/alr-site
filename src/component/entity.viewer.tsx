import * as React from 'react'
import { ENTITY, ENTITY_COLOR, ENTITY_LABEL } from '@/utils/constants'
import { Theme, useTheme } from '@mui/material/styles'
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectProps,
  Typography,
} from '@mui/material'

interface TextDisplayProps extends SelectProps {
  editing?: boolean
  value?: ENTITY[]
}

const Entities = [
  { label: ENTITY_LABEL.AUX, value: ENTITY.AUXILIARY },
  { label: ENTITY_LABEL.AL, value: ENTITY.LEGION },
  { label: ENTITY_LABEL.SAL, value: ENTITY.SAL },
]

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
  value = [],
  fullWidth,
  size = 'small',
  ...selectProps
}: TextDisplayProps) {
  const theme = useTheme()

  if (editing)
    return (
      <FormControl fullWidth>
        <InputLabel id='entity-select-label'>{value.length > 1 ? 'Entities' : 'Entity'}</InputLabel>
        <Select
          labelId='entity-select-label'
          id='entity-select'
          multiple
          value={value}
          input={
            <OutlinedInput
              id='select-multiple-chip'
              label={value.length > 1 ? 'Entities' : 'Entity'}
            />
          }
          renderValue={(selected) => {
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as ENTITY[]).map((value) => (
                  <Chip key={value} label={Entities.find((e) => e.value === value)?.label} />
                ))}
              </Box>
            )
          }}
          MenuProps={MenuProps}
          {...selectProps}
        >
          {Entities.map((entity) => (
            <MenuItem
              key={entity.value}
              value={entity.value}
              style={getStyles(entity.value, value, theme)}
            >
              {entity.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )

  return (
    <Box
      component='span'
      sx={{
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
        display: fullWidth ? 'flex' : 'inline-block',
        alignItems: fullWidth ? 'center' : undefined,
      }}
    >
      <Box
        sx={{
          borderRight: (theme) => `1px solid ${theme.vars.palette.divider}`,
          px: 1.5,
          height: size === 'medium' ? 56 : 40,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'inline-block',
        }}
      >
        <Typography
          variant='subtitle2'
          fontSize='1.05rem'
          component='span'
          lineHeight={size === 'medium' ? '56px' : '40px'}
        >
          {value.length > 1 ? 'Entities' : 'Entity'}
        </Typography>
      </Box>
      <Typography component='span' sx={{ minWidth: '182px', px: 1, display: 'inline-block' }}>
        {value.map((e) => (
          <Chip
            key={e}
            label={ENTITY_LABEL[e]}
            size={size}
            sx={{ bgcolor: ENTITY_COLOR[e].background, color: ENTITY_COLOR[e].text, mr: 1 }}
          />
        ))}
      </Typography>
    </Box>
  )
}
