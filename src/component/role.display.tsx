import * as React from 'react'
import { MEMBER_ROLE } from '@/utils/constants'
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

interface TextDisplayProps extends SelectProps {
  editing?: boolean
  value?: MEMBER_ROLE
}

const Roles = [
  MEMBER_ROLE.ABANDONED,
  MEMBER_ROLE.CHARTER,
  MEMBER_ROLE.DISCHARGED,
  MEMBER_ROLE.MEMBER,
  MEMBER_ROLE.PROSPECT,
  MEMBER_ROLE.SUPPORTER,
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

export default function RoleDisplay({
  editing,
  value,
  fullWidth,
  size = 'small',
  ...selectProps
}: TextDisplayProps) {
  const theme = useTheme()

  if (editing)
    return (
      <FormControl fullWidth>
        <InputLabel id='role-select-label'>Status</InputLabel>
        <Select
          labelId='role-select-label'
          id='role-select'
          value={value || ''}
          label='Status'
          {...selectProps}
        >
          {Roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
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
          Status
        </Typography>
      </Box>
      <Typography component='span' sx={{ minWidth: '182px', px: 1, display: 'inline-block' }}>
        {value || ''}
      </Typography>
    </Box>
  )
}
