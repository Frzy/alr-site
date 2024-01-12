'use client'

import type { ActivityLog, Member } from '@/types/common'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import MemberInformation from '../Member/Information'
import { isMemberAdmin } from '@/utils/member'
import EventTracker from '../Member/EventTracker'
import { Stack } from '@mui/material'
import ActivityLogViewer from '../Activity Log/Viewer'
import MemberEditDialog from '../Member/EditDialog'
import React from 'react'
import { useQueryState } from 'next-usequerystate'
import { useHotkeys } from 'react-hotkeys-hook'

export default function SProfileView({
  member,
  logs,
  title,
}: {
  member: Member
  logs: ActivityLog[]
  title?: React.ReactNode
}): JSX.Element {
  const [open, setOpen] = useQueryState('edit', {
    history: 'push',
  })
  const isAdmin = isMemberAdmin(member)
  useHotkeys('e', async () => await setOpen('true'))

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={1}>
        <MemberInformation
          member={member}
          permission={isAdmin ? 'admin' : 'member'}
          onEdit={async () => {
            await setOpen('true')
          }}
          isLoggedIn
        />
        <EventTracker member={member} logs={logs} />
        <ActivityLogViewer logs={logs} isPrivate />
      </Stack>
      <MemberEditDialog
        member={member}
        maxWidth='md'
        open={!!open}
        title='Update your Profile'
        onClose={async () => {
          await setOpen(null)
        }}
      />
    </LocalizationProvider>
  )
}
