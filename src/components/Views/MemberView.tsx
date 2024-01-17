'use client'

import type { ActivityLog, Member, ServerMember } from '@/types/common'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import MemberInformation from '../Member/Information'
import { mapToClientMember, memberToSessionUser } from '@/utils/member'
import EventTracker from '../Member/EventTracker'
import { Stack } from '@mui/material'
import ActivityLogViewer from '../Activity Log/Viewer'
import MemberEditDialog from '../Member/EditDialog'
import React from 'react'
import { useQueryState } from 'next-usequerystate'
import { useHotkeys } from 'react-hotkeys-hook'
import { useSession } from 'next-auth/react'

interface MemberViewProps {
  severMember: ServerMember
  logs: ActivityLog[]
  title?: React.ReactNode
  isMember?: boolean
  isViewingOwnProfile?: boolean
  isAdmin?: boolean
}

export default function MemberView({
  severMember,
  isViewingOwnProfile,
  isMember,
  isAdmin,
  logs,
}: MemberViewProps): JSX.Element {
  const { update } = useSession()
  const [member, setMember] = React.useState(mapToClientMember(severMember))
  const [open, setOpen] = useQueryState('edit', {
    history: 'push',
  })
  useHotkeys('e', openEditDialog)

  async function openEditDialog(): Promise<void> {
    if (!!isAdmin || !!isViewingOwnProfile) await setOpen('true')
  }

  async function handleProfileUpdate(data: Member): Promise<void> {
    setMember(data)
    await update(memberToSessionUser(data))
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={1}>
        <MemberInformation
          member={member}
          permission={isAdmin ? 'admin' : isMember ? 'member' : 'unknown'}
          onEdit={openEditDialog}
          isLoggedIn={isViewingOwnProfile}
        />
        {(!!isAdmin || !!isViewingOwnProfile) && <EventTracker member={member} logs={logs} />}
        <ActivityLogViewer logs={logs} isPrivate={isViewingOwnProfile} />
      </Stack>
      <MemberEditDialog
        member={member}
        maxWidth='md'
        onUpdate={handleProfileUpdate}
        open={!!open}
        title='Update your Profile'
        onClose={async () => {
          await setOpen(null)
        }}
      />
    </LocalizationProvider>
  )
}
