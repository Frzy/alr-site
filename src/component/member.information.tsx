import { Paper } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { useSession } from 'next-auth/react'
import * as React from 'react'
import TextDisplay from './text.display'
import EntityDisplay from './entity.viewer'
import RoleDisplay from './role.display'
import OfficeDisplay from './officer.display'

import type { Member } from '@/types/common'

const enum Mode {
  Edit = 'edit',
  View = 'view',
}

interface MemberInformationProps {
  member: Member
}

export default function MemberInformation({ member }: MemberInformationProps) {
  const session = useSession()
  const [mode, setMode] = React.useState<Mode>(Mode.Edit)
  const isOfficer = !!session.data?.user.office
  const isLoggedIn = !!session.data?.user
  const editing = mode === Mode.Edit && isLoggedIn
  const isMember = session.data?.user.id === member.id

  return (
    <Paper sx={{ p: 1, pt: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} lg={4}>
          <TextDisplay
            label='First Name'
            name='firstName'
            value={member.firstName}
            variant='outlined'
            editing={editing}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        <Grid xs={8} lg={4}>
          <TextDisplay
            label='Last Name'
            name='lastName'
            value={member.lastName}
            variant='outlined'
            editing={editing}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        {(editing || member.suffix) && (
          <Grid xs={4} lg={1}>
            <TextDisplay
              label='Suffix'
              name='suffix'
              value={member.suffix}
              variant='outlined'
              editing={editing}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        <Grid xs={12} lg={editing || member.suffix ? 3 : 4}>
          <TextDisplay
            label='Nickname'
            name='nickName'
            value={member.nickName}
            variant='outlined'
            editing={editing}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        {session.data?.user && (
          <Grid xs={12} md={6}>
            <TextDisplay
              label='Email'
              name='email'
              value={member.email}
              variant='outlined'
              editing={editing}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        {isLoggedIn && (
          <Grid xs={12} md={6}>
            <TextDisplay
              label='Phone Number'
              name='phoneNumber'
              value={member.phoneNumber}
              variant='outlined'
              editing={editing}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        {(isMember || isOfficer) && (
          <Grid xs={12} md={6}>
            <TextDisplay
              label='Membership Id'
              name='membershipId'
              value={member.membershipId}
              variant='outlined'
              editing={editing && isOfficer}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        {(isMember || isOfficer) && (
          <Grid xs={12} md={6}>
            <RoleDisplay
              name='role'
              value={member.role}
              editing={editing && isOfficer}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}

        <Grid xs={12} md={6}>
          <OfficeDisplay
            name='office'
            value={member.office}
            editing={editing && isOfficer}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>

        <Grid xs={12}>
          <EntityDisplay value={member.entity} editing={editing} fullWidth />
        </Grid>
      </Grid>
    </Paper>
  )
}
