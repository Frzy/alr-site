import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
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
import moment, { Moment } from 'moment'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import UncheckedCheckBoxIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import EditIcon from '@mui/icons-material/Edit'
import { ENTITY, MEMBER_ROLE } from '@/utils/constants'

const enum Mode {
  Edit = 'edit',
  View = 'view',
}

interface MemberInformationProps {
  member: Member
  onSave?: (newMember: Member) => Promise<void>
  onChange?: (data: Partial<Member>) => void
  onReset?: () => void
  disabled?: boolean
}

export default function MemberInformation({
  disabled,
  member,
  onChange,
  onReset,
  onSave,
}: MemberInformationProps) {
  const session = useSession()
  const [mode, setMode] = React.useState<Mode>(Mode.View)
  const isOfficer = !!session.data?.user.office
  const isLoggedIn = !!session.data?.user
  const isEditing = mode === Mode.Edit && isLoggedIn
  const isMember = session.data?.user.id === member.id
  const [loading, setLoading] = React.useState(false)

  function handleCancel() {
    if (onReset) onReset()
    setMode(Mode.View)
  }
  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    handleChange({ [name]: value })
  }
  function handleEntityChange(event: SelectChangeEvent<ENTITY | ENTITY[]>) {
    const { name, value } = event.target

    handleChange({ [name]: value })
  }
  function handleSelectChange(event: SelectChangeEvent) {
    const { name, value } = event.target

    handleChange({ [name]: value })
  }
  function handleDateChange(date: Moment | null) {
    handleChange({ joined: date ? date.format('M/D/YYYY') : '' })
  }
  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target

    handleChange({ [name]: checked })
  }
  function handleChange(memberPart: Partial<Member>) {
    if (onChange) onChange(memberPart)
  }
  async function handleSave() {
    setLoading(true)
    if (onSave) await onSave({ ...member })
    setLoading(false)
    setMode(Mode.View)
  }

  return (
    <Paper sx={{ p: 1, pt: 2 }}>
      <Stack spacing={1}>
        <Box display='flex' alignItems='center'>
          <Typography component={'h2'} variant='h4' sx={{ flexGrow: 1 }} gutterBottom>
            Profile
          </Typography>
          {(isMember || isOfficer) && mode === Mode.View && (
            <Button
              sx={{ px: 2, height: 36 }}
              onClick={() => setMode(Mode.Edit)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )}
        </Box>
        {mode === Mode.View ? (
          <Grid container spacing={2}>
            <Grid xs={6} md={4} lg={3}>
              <TextDisplay label='Name' value={member.name} />
            </Grid>
            <Grid xs={6} md={4} lg={3}>
              <TextDisplay label='Membership Id' value={member.membershipId || '{Empty}'} />
            </Grid>
            <Grid xs={6} md={4} lg={3}>
              <TextDisplay label='Nickname' value={member.nickName || '{Empty}'} />
            </Grid>
            {member.role === MEMBER_ROLE.PROSPECT ? (
              <Grid xs={6} md={4} lg={3}>
                <TextDisplay label='Rides' value={`${member.rides ? member.rides : 0} / 3`} />
              </Grid>
            ) : (
              <Grid xs={6} md={4} lg={3}>
                <TextDisplay label='Joined On' value={member.joined || '{Empty}'} />
              </Grid>
            )}
            <Grid xs={6} md={4} lg={3}>
              <TextDisplay label='Status' value={member.role} />
            </Grid>
            <Grid xs={6} md={4} lg={3}>
              <TextDisplay label='Office' value={member.office || 'None'} />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <TextDisplay label='Email' value={member.email} />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <TextDisplay label='Phone Number' value={member.phoneNumber} />
            </Grid>
            <Grid xs={12}>
              <EntityDisplay values={member.entity} size='medium' fullWidth />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Alert severity='info'>
                Please note that updating your first or last name will update your user name that.
                Your username is the first letter of your first name followed by your last name.
                Please contact a system admin to adjust your activity log entries so they show up
                under the new name.
              </Alert>
            </Grid>
            <Grid xs={12} md={4}>
              <TextDisplay
                label='First Name'
                name='firstName'
                value={member.firstName}
                autoComplete='given-name name'
                editing={isEditing}
                size={isEditing ? 'medium' : 'small'}
                onChange={handleTextChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            <Grid xs={8} md={4}>
              <TextDisplay
                label='Last Name'
                name='lastName'
                autoComplete='family-name name'
                value={member.lastName}
                editing={isEditing}
                size={isEditing ? 'medium' : 'small'}
                onChange={handleTextChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            <Grid xs={4} md={1}>
              <TextDisplay
                label='Suffix'
                name='suffix'
                autoComplete='honorific-suffix'
                value={member.suffix}
                editing={isEditing}
                size={isEditing ? 'medium' : 'small'}
                onChange={handleTextChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextDisplay
                label='Nickname'
                name='nickName'
                value={member.nickName}
                editing={isEditing}
                autoComplete='nickname'
                size={isEditing ? 'medium' : 'small'}
                onChange={handleTextChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={isOfficer ? 4 : 6}>
              <TextDisplay
                label='Email'
                name='email'
                value={member.email}
                editing={isEditing}
                size={isEditing ? 'medium' : 'small'}
                type='email'
                onChange={handleTextChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={isOfficer ? 4 : 6}>
              <PhoneField
                label='Phone Number'
                name='phoneNumber'
                value={member.phoneNumber}
                editing={isEditing}
                size={isEditing ? 'medium' : 'small'}
                autoComplete='tel'
                onChange={handleTextChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <EntityDisplay
                values={member.entity}
                editing={isEditing}
                size={isEditing ? 'medium' : 'small'}
                onChange={handleEntityChange}
                disabled={disabled || loading}
                fullWidth
              />
            </Grid>
            {isOfficer && (
              <React.Fragment>
                <Grid xs={12} md={4} lg={3}>
                  <TextDisplay
                    label='Membership Id'
                    name='membershipId'
                    value={member.membershipId}
                    editing={isEditing}
                    size={isEditing ? 'medium' : 'small'}
                    onChange={handleTextChange}
                    disabled={disabled || loading}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={4} lg={3}>
                  <RoleDisplay
                    name='role'
                    value={member.role}
                    editing={isEditing}
                    size={isEditing ? 'medium' : 'small'}
                    onChange={handleSelectChange}
                    disabled={disabled || loading}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={4} lg={3}>
                  <OfficeDisplay
                    name='office'
                    value={member.office}
                    editing={isEditing}
                    size={isEditing ? 'medium' : 'small'}
                    onChange={handleSelectChange}
                    disabled={disabled || loading}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={4} lg={3}>
                  <DateDisplay
                    label='Joined On'
                    value={moment(member.joined, 'MM-DD-YYYY')}
                    editing={isEditing && isOfficer}
                    size={isEditing ? 'medium' : 'small'}
                    onChange={handleDateChange}
                    disabled={disabled || loading}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} md={4} lg={3}>
                  <TextDisplay
                    label='Canidate Rides'
                    name='rides'
                    value={member.rides ? member.rides : '0'}
                    type='number'
                    editing={isEditing && isOfficer}
                    size={isEditing ? 'medium' : 'small'}
                    onChange={handleTextChange}
                    disabled={disabled || loading}
                    inputProps={{ min: 0, max: 3 }}
                    fullWidth
                  />
                </Grid>
                <Grid xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isLifeTimeMember'
                        checked={member.isLifeTimeMember}
                        onChange={handleCheckboxChange}
                        disabled={disabled || loading}
                      />
                    }
                    label='Lifetime Member'
                  />
                </Grid>
                <Grid xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isRetired'
                        checked={member.isRetired}
                        onChange={handleCheckboxChange}
                        disabled={disabled || loading}
                      />
                    }
                    label='Retired Member'
                  />
                </Grid>
                <Grid xs={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name='isPastPresident'
                        checked={member.isPastPresident}
                        onChange={handleCheckboxChange}
                        disabled={disabled || loading}
                      />
                    }
                    label='Past President'
                  />
                </Grid>
              </React.Fragment>
            )}
          </Grid>
        )}
        {mode === Mode.Edit && (
          <Box display='flex' justifyContent='flex-end' gap={2} px={1}>
            <Button disabled={disabled || loading} onClick={handleCancel}>
              Cancel
            </Button>
            <LoadingButton loading={loading} variant='contained' onClick={handleSave}>
              Save
            </LoadingButton>
          </Box>
        )}
      </Stack>
    </Paper>
  )
}
