import * as React from 'react'
import TextDisplay from './TextDisplay'
import { Avatar, Box } from '@mui/material'
import type { Member } from '@/types/common'
import { memberAvatar } from '@/utils/member'

interface AvatarDisplayProps {
  fullWidth?: boolean
  label?: string
  member: Member
  value?: string
}

export default function AvatarDisplay({
  member,
  label = 'Profile Image',
  value = '',
}: AvatarDisplayProps): JSX.Element {
  return (
    <Box display='flex' alignItems='center' gap={2}>
      {value ? (
        <Avatar alt={member?.name} src={value} sx={{ width: 56, height: 56 }}>
          {`${member.firstName.slice(0, 1)}${member.lastName.slice(0, 1)}`}
        </Avatar>
      ) : (
        <Avatar {...memberAvatar(member)} />
      )}
      <TextDisplay label={label} value={value} fullWidth />
    </Box>
  )
}
