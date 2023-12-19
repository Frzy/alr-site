import * as React from 'react'
import TextDisplay from './text.display'
import { Avatar, Box } from '@mui/material'

import type { TextFieldProps } from '@mui/material'
import { Member } from '@/types/common'
import { stringAvatar } from '@/utils/helpers'

interface ImageDisplayProps extends Omit<TextFieldProps, 'variant'> {
  editing?: boolean
  disabled?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  member: Member
  value?: string
  label?: string
}

export default function ImageDisplay({
  editing,
  size = 'medium',
  member,
  label = 'Profile Image',
  value = '',
  ...other
}: ImageDisplayProps) {
  if (!editing) {
    return (
      <Box display='flex' alignItems='center' gap={2}>
        {value ? (
          <Avatar alt={member?.name} src={value} sx={{ width: 56, height: 56 }}>
            {`${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`}
          </Avatar>
        ) : (
          <Avatar {...stringAvatar(member)} />
        )}
        <TextDisplay fullWidth size={size} label={label} value={value} />
      </Box>
    )
  }

  return (
    <Box display='flex' alignItems='center' gap={2}>
      {value ? (
        <Avatar alt={member.name} src={value} sx={{ width: 56, height: 56 }}>
          {`${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`}
        </Avatar>
      ) : (
        <Avatar {...stringAvatar(member)} />
      )}
      <TextDisplay
        editing
        size={size}
        label={label}
        value={value}
        placeholder='Please enter URL to the image'
        {...other}
      />
    </Box>
  )
}
