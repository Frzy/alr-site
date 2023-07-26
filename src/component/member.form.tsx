import * as React from 'react'
import {
  Alert,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Grid from '@mui/material/Unstable_Grid2'
import { useSession } from 'next-auth/react'
import { Moment } from 'moment'
import { Member } from '@/types/common'
import { ENTITY } from '@/utils/constants'

interface MembershipFormProps {
  member: Member
  onSave?: (newMember: Member) => Promise<void>
  onComplete?: () => 
  onChange?: (data: Partial<Member>) => void
}

export default function MembershipForm({ member: initMember, onChange }: MembershipFormProps) {
  const session = useSession()
  const isOfficer = !!session.data?.user.office
  const [member, setMember] = React.useState<Member>(initMember)

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

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <Alert severity='info'>
          Please note that updating your first or last name will update your user name that. Your
          username is the first letter of your first name followed by your last name. Please contact
          a system admin to adjust your activity log entries so they show up under the new name.
        </Alert>
      </Grid>
      <Grid xs={12} md={4}>
        <TextField
          label='First Name'
          name='firstName'
          value={member.firstName}
          autoComplete='given-name name'
          onChange={handleTextChange}
          disabled={disabled || loading}
          fullWidth
        />
      </Grid>
      <Grid xs={8} md={4}>
        <TextField
          label='Last Name'
          name='lastName'
          autoComplete='family-name name'
          value={member.lastName}
          onChange={handleTextChange}
          disabled={disabled || loading}
          fullWidth
        />
      </Grid>
      <Grid xs={4} md={1}>
        <TextField
          label='Suffix'
          name='suffix'
          autoComplete='honorific-suffix'
          value={member.suffix}
          onChange={handleTextChange}
          disabled={disabled || loading}
          fullWidth
        />
      </Grid>
      <Grid xs={12} md={3}>
        <TextField
          label='Nickname'
          name='nickName'
          value={member.nickName}
          autoComplete='nickname'
          onChange={handleTextChange}
          disabled={disabled || loading}
          fullWidth
        />
      </Grid>
      <Grid xs={12} md={isOfficer ? 4 : 6}>
        <TextField
          label='Email'
          name='email'
          value={member.email}
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
          autoComplete='tel'
          onChange={handleTextChange}
          disabled={disabled || loading}
          fullWidth
        />
      </Grid>
      <Grid xs={12}>
        <EntityDisplay
          values={member.entity}
          onChange={handleEntityChange}
          disabled={disabled || loading}
          fullWidth
        />
      </Grid>
      {isOfficer && (
        <React.Fragment>
          <Grid xs={12}>
            <Box display='flex' alignItems='center' justifyContent='center'>
              <Divider sx={{ flexGrow: 1 }} />
              <Typography variant='h5' fontWeight='fontWeightBold' sx={{ px: 1 }}>
                Officers Only
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>
          </Grid>
          <Grid xs={12} md={4} lg={3}>
            <TextField
              label='Membership Id'
              name='membershipId'
              value={member.membershipId}
              onChange={handleTextChange}
              disabled={disabled || loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4} lg={3}>
            <RoleDisplay
              name='role'
              value={member.role}
              onChange={handleSelectChange}
              disabled={disabled || loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4} lg={3}>
            <OfficeDisplay
              name='office'
              value={member.office}
              onChange={handleSelectChange}
              disabled={disabled || loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4} lg={3}>
            <DateDisplay
              label='Joined On'
              value={member.joined ? moment(member.joined, 'MM-DD-YYYY') : null}
              editing={isEditing && isOfficer}
              onChange={handleDateChange}
              disabled={disabled || loading}
              fullWidth
            />
          </Grid>
          {member.role === ROLE.PROSPECT && (
            <Grid xs={12} md={4} lg={3}>
              <TextField
                label='Canidate Rides'
                name='rides'
                value={member.rides ? member.rides : '0'}
                type='number'
                editing={isEditing && isOfficer}
                onChange={handleTextChange}
                disabled={disabled || loading}
                inputProps={{ min: 0, max: 3 }}
                fullWidth
              />
            </Grid>
          )}
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
  )
}
