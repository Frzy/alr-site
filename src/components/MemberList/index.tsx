'use client'

import * as React from 'react'
import Paper from '@mui/material/Paper'
import MemberListHeader from './Header'
import type { ListMode, Member } from '@/types/common'
import MemberList from './List'
import MemberGridList from './Grid'

interface MemeberViewerProps {
  members: Member[]
}

export default function MemberViewer({ members }: MemeberViewerProps): JSX.Element {
  const [listMode, setListMode] = React.useState<ListMode>('grid')

  function handleModeChange(newMode: ListMode): void {
    setListMode(newMode)
  }

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <MemberListHeader listMode={listMode} onListModeChange={handleModeChange} />
      {listMode === 'list' ? (
        <MemberList members={members} />
      ) : (
        <MemberGridList members={members} />
      )}
    </Paper>
  )
}
