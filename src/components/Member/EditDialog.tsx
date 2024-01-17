'use client'

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  type DialogProps,
  type SelectChangeEvent,
  type Theme,
  Typography,
  useMediaQuery,
} from '@mui/material'
import type { Member } from '@/types/common'
import { LoadingButton } from '@mui/lab'
import React from 'react'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { isMemberAdmin } from '@/utils/member'
import { useHotkeys } from 'react-hotkeys-hook'
import PhoneField from '../PhoneField'
import NumbersIcon from '@mui/icons-material/Numbers'
import { SendNotification } from '@/utils/helpers'
import RoleSelect from '../RoleSelect'
import OfficeSelect from '../OfficerSelect'
import { type Dayjs } from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers'
import { CANIDATE_ROLES, type ENTITY, ROLE } from '@/utils/constants'
import AvatarField from '../AvatarField'
import EntitySelect from '../EntitySelect'
import HelpIcon from '@mui/icons-material/Help'

interface MemberEditDialogProps extends DialogProps {
  member: Member
  title?: string
  onUpdate?: (member: Member) => void
  onClose?: (
    event: Record<string, unknown>,
    reason: 'backdropClick' | 'escapeKeyDown' | 'updateCancelled' | 'updateCompleted',
  ) => void
}

export default function MemberEditDialog({
  fullScreen,
  member: initMember,
  onClose,
  onUpdate,
  title,
  ...props
}: MemberEditDialogProps): JSX.Element {
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const [member, setMember] = React.useState(initMember)
  const { showNameWarning, showUsernameWarning } = React.useMemo(() => {
    const memberName = `${member.firstName} ${member.lastName}${
      member.suffix ? ` ${member.suffix}` : ''
    }`
    return {
      showNameWarning: initMember.name !== memberName,
      showUsernameWarning: initMember.username !== member.username,
    }
  }, [member, initMember])
  const isAdmin = isMemberAdmin(initMember)
  const [loading, setLoading] = React.useState(false)
  const [fetchingId, setFetchingId] = React.useState(false)
  useHotkeys(
    'mod+s',
    async (event) => {
      await saveMember()
      event.preventDefault()
    },
    { enableOnFormTags: true },
  )

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target

    updateMember({ [name]: value })
  }
  function handleNumberChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target
    const number = parseFloat(value)

    updateMember({ [name]: isNaN(number) ? 0 : number })
  }
  function handleSelectChange(event: SelectChangeEvent): void {
    const { name, value } = event.target

    updateMember({ [name]: value })
  }
  function handleEntityChange(event: SelectChangeEvent<ENTITY | ENTITY[]>): void {
    const { name, value } = event.target

    updateMember({ [name]: value })
  }
  function handleDateChange(name: 'joined', newValue: Dayjs | null): void {
    if (newValue) updateMember({ [name]: newValue })
  }
  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, checked } = event.target

    updateMember({ [name]: checked })
  }
  function handleEmergencyContactChange(
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void {
    const { value, name } = event.target
    const emergencyContacts = [...member.emergencyContacts]

    emergencyContacts[index] = { ...emergencyContacts[index], [name]: value }

    updateMember({ emergencyContacts })
  }
  function handleClose(
    event: Record<string, unknown>,
    reason: 'backdropClick' | 'escapeKeyDown' | 'updateCancelled' | 'updateCompleted',
  ): void {
    if (onClose && !loading) {
      if (reason !== 'updateCompleted') setMember(initMember)
      onClose(event, reason)
    }
  }

  function updateMember(data: Partial<Member>): void {
    setMember((prev) => ({ ...prev, ...data }))
  }
  async function fetchMembershipId(): Promise<void> {
    setFetchingId(true)
    try {
      const response = await fetch('/api/membership/new-id')

      const data = await response.json()

      updateMember({ membershipId: data })
    } catch (error) {
      SendNotification('Failed to fetch the next Membership Id', 'error')
    } finally {
      setFetchingId(false)
    }
  }
  async function saveMember(): Promise<void> {
    setLoading(true)

    try {
      const response = await fetch(`/api/member/${member.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      })
      const data = (await response.json()) as Member

      setMember(data)

      if (onUpdate) onUpdate(data)
      if (onClose) onClose({}, 'updateCompleted')
      SendNotification('Updated successfully', 'success')
    } catch (error) {
      SendNotification('Failed to update information', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog onClose={handleClose} {...props} fullScreen={isSmall ? true : fullScreen}>
      <DialogTitle>{title ?? `Edit ${member.name}'s Information`}</DialogTitle>
      <DialogContent>
        <Grid container columnSpacing={1} rowSpacing={2} sx={{ pt: 1 }}>
          {showNameWarning && (
            <Grid xs={12}>
              <Alert severity='warning' variant='outlined'>
                Changing your name might cause activity logs to not show up properly. Contact a
                system administrator for help re-linking the activity logs if this happens.
              </Alert>
            </Grid>
          )}
          <Grid xs={12} md={5}>
            <TextField
              label='First Name'
              name='firstName'
              value={member.firstName}
              autoComplete='given-name name'
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={9} sm={10} md={5}>
            <TextField
              label='Last Name'
              name='lastName'
              autoComplete='family-name name'
              value={member.lastName}
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={3} sm={2}>
            <TextField
              label='Suffix'
              name='suffix'
              autoComplete='honorific-suffix'
              value={member.suffix}
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              label='Nickname'
              name='nickName'
              value={member.nickName}
              autoComplete='nickname'
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              label='Miles to Post'
              name='milesToPost'
              value={member.milesToPost || ''}
              autoComplete='off'
              onChange={handleNumberChange}
              type='number'
              inputProps={{
                min: 0,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment sx={{ cursor: 'default' }} position='end'>
                    <Tooltip title='This will help calculate distance when estimating miles traveled when submitting log entries.'>
                      <HelpIcon />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              label='Email'
              name='email'
              value={member.email}
              type='email'
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <PhoneField
              label='Phone Number'
              name='phoneNumber'
              value={member.phoneNumber}
              autoComplete='tel'
              onChange={handleTextChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <EntitySelect
              values={member.entity}
              onChange={handleEntityChange}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <AvatarField
              member={member}
              name='image'
              value={member.image}
              label='Avatar Image'
              disabled={loading}
              placeholder='Add Image Link'
              onChange={handleTextChange}
              fullWidth
            />
          </Grid>
          <Grid xs={12}>
            <Typography component={'h3'} variant='body2' sx={{ fontSize: '1.1rem' }}>
              Emergency Contacts
            </Typography>
          </Grid>
          <Grid xs={6}>
            <TextField
              label='Name'
              name='name'
              value={member.emergencyContacts[0].name}
              autoComplete='off'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleEmergencyContactChange(event, 0)
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={6}>
            <PhoneField
              label='Phone Number'
              name='phone'
              value={member.emergencyContacts[0].phone}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleEmergencyContactChange(event, 0)
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              label='Name'
              name='name'
              value={member.emergencyContacts[1].name}
              autoComplete='off'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleEmergencyContactChange(event, 1)
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={6}>
            <PhoneField
              label='Phone Number'
              name='phone'
              value={member.emergencyContacts[1].phone}
              autoComplete='off'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleEmergencyContactChange(event, 1)
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              label='Name'
              name='name'
              value={member.emergencyContacts[2].name}
              autoComplete='off'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleEmergencyContactChange(event, 2)
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>
          <Grid xs={6}>
            <PhoneField
              label='Phone Number'
              name='phone'
              value={member.emergencyContacts[2].phone}
              autoComplete='off'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleEmergencyContactChange(event, 2)
              }}
              disabled={loading}
              fullWidth
            />
          </Grid>
        </Grid>
        {isAdmin && (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid xs={12}>
              <Box display='flex' alignItems='center' justifyContent='center'>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant='h5' fontWeight='fontWeightBold' sx={{ px: 1 }}>
                  Administrator Only
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>
            </Grid>
            {showUsernameWarning && (
              <Grid xs={12}>
                <Alert severity='warning' variant='outlined'>
                  Changing the username will require a relogin
                </Alert>
              </Grid>
            )}
            <Grid xs={12} md={4} lg={3}>
              <TextField
                label='Membership Id'
                name='membershipId'
                value={member.membershipId}
                onChange={handleTextChange}
                disabled={loading || fetchingId}
                InputProps={
                  fetchingId
                    ? {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <CircularProgress size={24} />
                          </InputAdornment>
                        ),
                      }
                    : !member.membershipId
                      ? {
                          endAdornment: (
                            <InputAdornment position='end'>
                              <Tooltip title='Get next MembershipId'>
                                <IconButton onClick={fetchMembershipId}>
                                  <NumbersIcon />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }
                      : undefined
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={4} lg={3}>
              <RoleSelect
                name='role'
                value={member.role}
                onChange={handleSelectChange}
                disabled={loading}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={4} lg={3}>
              <OfficeSelect
                name='office'
                value={member.office}
                onChange={handleSelectChange}
                disabled={loading}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={4} lg={3}>
              <DatePicker
                label='Joined'
                value={member.joined ? member.joined : null}
                onChange={(value, context) => {
                  handleDateChange('joined', value)
                }}
                disableFuture
                disabled={loading}
              />
            </Grid>
            <Grid xs={12} md={4} lg={3}>
              <TextField
                label='Username'
                name='username'
                value={member.username}
                onChange={handleTextChange}
                disabled={loading}
                fullWidth
              />
            </Grid>
            {CANIDATE_ROLES.includes(member.role) && (
              <Grid xs={12} md={4} lg={3}>
                <TextField
                  label={member.role === ROLE.PROSPECT ? 'Canidate Rides' : 'Canidate Events'}
                  name='rides'
                  value={member.rides ? member.rides : '0'}
                  type='number'
                  onChange={handleTextChange}
                  disabled={loading}
                  inputProps={{ min: 0, max: 3 }}
                  fullWidth
                />
              </Grid>
            )}
            <Grid xs={6} md={4} lg={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isLifeTimeMember'
                    checked={member.isLifeTimeMember}
                    onChange={handleCheckboxChange}
                    disabled={loading}
                  />
                }
                label='Lifetime Member'
              />
            </Grid>
            <Grid xs={6} md={4} lg={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='isPastPresident'
                    checked={member.isPastPresident}
                    onChange={handleCheckboxChange}
                    disabled={loading}
                  />
                }
                label='Past President'
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={loading}
          sx={{ color: 'inherit' }}
          onClick={() => {
            if (onClose) handleClose({}, 'updateCancelled')
          }}
        >
          Cancel
        </Button>
        <LoadingButton loading={loading} onClick={saveMember}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
