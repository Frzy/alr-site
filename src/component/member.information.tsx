import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { useSession } from 'next-auth/react'
import * as React from 'react'
import TextDisplay from './text.display'
import EntityDisplay from './entity.viewer'
import RoleDisplay from './role.display'
import OfficeDisplay from './officer.display'

import type { Member } from '@/types/common'
import PhoneField from './phone.number.field'
import DateDisplay from './date.display'
import moment from 'moment'
import ActiviyLogNames from './activity.log.names'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import UncheckedCheckBoxIcon from '@mui/icons-material/CheckBoxOutlineBlank'

const enum Mode {
  Edit = 'edit',
  View = 'view',
}

interface MemberInformationProps {
  member: Member
}

export default function MemberInformation({ member }: MemberInformationProps) {
  const session = useSession()
  const [mode, setMode] = React.useState<Mode>(Mode.View)
  const isOfficer = !!session.data?.user.office
  const isLoggedIn = !!session.data?.user
  const editing = mode === Mode.Edit && isLoggedIn
  const isMember = session.data?.user.id === member.id

  return (
    <Paper sx={{ p: 1, pt: 2 }}>
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <TextDisplay
            label='First Name'
            name='firstName'
            value={member.firstName}
            autoComplete='given-name name'
            editing={editing}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        <Grid xs={8} md={4}>
          <TextDisplay
            label='Last Name'
            name='lastName'
            autoComplete='family-name name'
            value={member.lastName}
            editing={editing}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        {(editing || member.suffix) && (
          <Grid xs={4} md={1}>
            <TextDisplay
              label='Suffix'
              name='suffix'
              autoComplete='honorific-suffix'
              value={member.suffix}
              editing={editing}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        <Grid xs={12} md={editing || member.suffix ? 3 : 4}>
          <TextDisplay
            label='Nickname'
            name='nickName'
            value={member.nickName}
            editing={editing}
            autoComplete='nickname'
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        {isLoggedIn && (
          <Grid xs={12} md={4}>
            <TextDisplay
              label='Email'
              name='email'
              value={member.email}
              editing={editing}
              size={editing ? 'medium' : 'small'}
              type='email'
              fullWidth
            />
          </Grid>
        )}
        {isLoggedIn && (
          <Grid xs={12} md={4}>
            <PhoneField
              label='Phone Number'
              name='phoneNumber'
              value={member.phoneNumber}
              editing={editing}
              size={editing ? 'medium' : 'small'}
              autoComplete='tel'
              fullWidth
            />
          </Grid>
        )}
        {(isMember || isOfficer) && (
          <Grid xs={12} md={4}>
            <TextDisplay
              label='Membership Id'
              name='membershipId'
              value={member.membershipId}
              editing={editing && isOfficer}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        {(isMember || isOfficer) && (
          <Grid xs={12} md={4}>
            <RoleDisplay
              name='role'
              value={member.role}
              editing={editing && isOfficer}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Grid>
        )}
        <Grid xs={12} md={4}>
          <OfficeDisplay
            name='office'
            value={member.office}
            editing={editing && isOfficer}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <DateDisplay
            label='Joined On'
            value={moment(member.joined, 'MM-DD-YYYY')}
            editing={editing && isOfficer}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        <Grid xs={12}>
          <EntityDisplay
            values={member.entity}
            editing={editing}
            size={editing ? 'medium' : 'small'}
            fullWidth
          />
        </Grid>
        <Grid xs={4} pl={2}>
          {editing ? (
            <FormControlLabel control={<Checkbox />} label='Lifetime Member' />
          ) : (
            <Box height='100%' display='flex' alignItems='center'>
              {member.isLifeTimeMember ? (
                <CheckBoxIcon sx={{ mx: '9px' }} />
              ) : (
                <UncheckedCheckBoxIcon sx={{ mx: '9px' }} />
              )}
              <Typography>Lifetime Member</Typography>
            </Box>
          )}
        </Grid>
        <Grid xs={4} pl={2}>
          {editing ? (
            <FormControlLabel control={<Checkbox />} label='Retired Member' />
          ) : (
            <Box height='100%' display='flex' alignItems='center'>
              {member.isRetired ? (
                <CheckBoxIcon sx={{ mx: '9px' }} />
              ) : (
                <UncheckedCheckBoxIcon sx={{ mx: '9px' }} />
              )}
              <Typography>Retired Member</Typography>
            </Box>
          )}
        </Grid>
        <Grid xs={4} pl={2}>
          {editing ? (
            <FormControlLabel control={<Checkbox />} label='Past President' />
          ) : (
            <Box height='100%' display='flex' alignItems='center'>
              {member.isPastPresident ? (
                <CheckBoxIcon sx={{ mx: '9px' }} />
              ) : (
                <UncheckedCheckBoxIcon sx={{ mx: '9px' }} />
              )}
              <Typography>Past President</Typography>
            </Box>
          )}
        </Grid>
        <Grid xs={12}>
          <Stack spacing={2}>
            <Alert severity='info'>
              This will link this profile to a name you submit in the activiy logs. Once linked then
              personal activity logs will display below.
            </Alert>
            <ActiviyLogNames
              editing={editing}
              value={member.activityLogLink}
              size={editing ? 'medium' : 'small'}
              fullWidth
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  )
}
