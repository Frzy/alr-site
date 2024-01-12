import * as React from 'react'
import { Avatar, Box, InputAdornment, TextField, type TextFieldProps } from '@mui/material'
import { memberAvatar } from '@/utils/member'
import type { Member } from '@/types/common'
import LinkIcon from '@mui/icons-material/Link'

type AvatarFieldProps = {
  member: Member
  value?: string
} & TextFieldProps

export default function AvatarField({
  member,
  value,
  ...textProps
}: AvatarFieldProps): JSX.Element {
  return (
    <Box display='flex' alignItems='center' gap={2}>
      {value ? (
        <Avatar alt={member?.name} src={value} sx={{ width: 56, height: 56 }}>
          {`${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`}
        </Avatar>
      ) : (
        <Avatar {...memberAvatar(member)} />
      )}
      <TextField
        value={value}
        {...textProps}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <LinkIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
