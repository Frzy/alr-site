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

interface OfficerDisplayProps extends SelectProps {
  editing?: boolean
  value?: OFFICER_POSITION
}

const Offices = [
  OFFICER_POSITION.DIRECTOR,
  OFFICER_POSITION.VICE_DIRECTOR,
  OFFICER_POSITION.JR_VICE,
  OFFICER_POSITION.SECRETARY,
  OFFICER_POSITION.TREASURER,
  OFFICER_POSITION.SGT_AT_ARMS,
  OFFICER_POSITION.ROAD_CAPTAIN,
  OFFICER_POSITION.HISTORIAN,
  OFFICER_POSITION.CHAPLAIN,
  OFFICER_POSITION.PAST_DIRECTOR,
]

export default function OfficeDisplay({
  editing,
  value,
  fullWidth,
  size = 'small',
  ...selectProps
}: OfficerDisplayProps) {
  const theme = useTheme()

  if (editing)
    return (
      <FormControl fullWidth={fullWidth}>
        <InputLabel id='office-select-label'>Office</InputLabel>
        <Select
          labelId='office-select-label'
          id='office-select'
          value={value || ''}
          label='Office'
          {...selectProps}
        >
          {Offices.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
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
          Office
        </Typography>
      </Box>
      <Typography component='span' sx={{ minWidth: '182px', px: 1, display: 'inline-block' }}>
        {value || ''}
      </Typography>
    </Box>
  )
}
