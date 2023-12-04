import * as React from 'react'

import { ACTIVE_ROLES, ENDPOINT, ENTITY, ROLE } from '@/utils/constants'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { Member } from '@/types/common'
import { useSession } from 'next-auth/react'
import DateDisplay from '@/component/date.display'
import EditIcon from '@mui/icons-material/Edit'
import EntityDisplay from '@/component/entity.viewer'
import FuzzySearch from 'fuzzy-search'
import Grid from '@mui/material/Unstable_Grid2'
import Head from 'next/head'
import Header from '@/component/header'
import ImageDisplay from '@/component/image.display'
import moment, { Moment } from 'moment'
import NumbersIcon from '@mui/icons-material/Numbers'
import OfficeDisplay from '@/component/officer.display'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PhoneField from '@/component/phone.number.field'
import ResponsiveDialog from '@/component/responsive.dialog'
import RoleDisplay from '@/component/role.display'
import SearchToolbar from '@/component/search.toolbar'
import TextDisplay from '@/component/text.display'
import useSWR, { Fetcher } from 'swr'

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Fab,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import Link from '@/component/link'

const fetcher: Fetcher<Member[], string> = async function fetcher(url) {
  const response = await fetch(url)
  const data = await response.json()

  return data
}

export default function AdminMembershipPage() {
  const { status, data: session } = useSession()
  const isAdmin = !!session?.user.office && status === 'authenticated'

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Admin Membership</title>
        <meta name='description' content='american legion riders chapter 91 admin membership' />
      </Head>
      <Header />
      <Container maxWidth='xl' sx={{ position: 'relative' }}>
        {status === 'loading' ? (
          <Paper sx={{ p: 2 }}>
            <LinearProgress />
          </Paper>
        ) : status === 'unauthenticated' || !isAdmin ? (
          <Paper sx={{ p: 1 }}>
            <Paper>
              <Alert severity='error'>Not Authorized</Alert>
            </Paper>
          </Paper>
        ) : (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <AdminMembership />
          </LocalizationProvider>
        )}
      </Container>
    </React.Fragment>
  )
}

function AdminMembership() {
  const { data, isLoading, mutate } = useSWR(ENDPOINT.MEMBERS, fetcher, {
    fallbackData: [],
  })
  const [membershipSearchTerm, setMembershipSearchTerm] = React.useState('')
  const [inactiveSearchTerm, setInactiveSearchTerm] = React.useState('')
  const { members, memberTitle } = React.useMemo(() => {
    const activeMembers = data.filter((m) => ACTIVE_ROLES.indexOf(m.role) !== -1)
    const memberCount = activeMembers.length

    if (membershipSearchTerm) {
      const searcher = new FuzzySearch(activeMembers, ['name', 'nickname'])
      const fuzzMembers = searcher.search(membershipSearchTerm)

      return {
        members: fuzzMembers,
        memberTitle: `Active Membership (${fuzzMembers.length} of ${memberCount})`,
      }
    }

    return {
      members: activeMembers,
      memberTitle: `Active Membership (${memberCount})`,
    }
  }, [data, membershipSearchTerm])
  const { inactiveMembers, inactiveTitle } = React.useMemo(() => {
    const inactiveMembers = data.filter((m) => ACTIVE_ROLES.indexOf(m.role) === -1)
    const memberCount = inactiveMembers.length

    if (inactiveSearchTerm) {
      const searcher = new FuzzySearch(inactiveMembers, ['name', 'nickname'])
      const fuzzMembers = searcher.search(inactiveSearchTerm)

      return {
        inactiveMembers: fuzzMembers,
        inactiveTitle: `Inactive Membership (${fuzzMembers.length} of ${memberCount})`,
      }
    }

    return {
      inactiveMembers,
      inactiveTitle: `Inactive Membership (${memberCount})`,
    }
  }, [data, inactiveSearchTerm])
  const [fetchingId, setFetchingId] = React.useState(false)
  const [editMember, setEditMember] = React.useState<Member>()
  const [showDeleteWarning, setShowDeleteWarning] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const dialogOpen = Boolean(editMember)
  const isCreatingMember = !Boolean(editMember?.id)

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    updateEditMember({ [name]: value })
  }
  function handleEntityChange(event: SelectChangeEvent<ENTITY | ENTITY[]>) {
    const { name, value } = event.target

    updateEditMember({ [name]: value })
  }
  function handleSelectChange(event: SelectChangeEvent) {
    const { name, value } = event.target

    updateEditMember({ [name]: value })
  }
  function handleDateChange(date: Moment | null) {
    updateEditMember({ joined: date ? date.format('M/D/YYYY') : '' })
  }
  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target

    updateEditMember({ [name]: checked })
  }
  function handleEmergencyContactChange(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const { value, name } = event.target
    if (editMember) {
      const emergencyContacts = [...editMember.emergencyContacts]

      emergencyContacts[index] = { ...emergencyContacts[index], [name]: value }

      updateEditMember({ emergencyContacts })
    }
  }
  function updateEditMember(part: Partial<Member>) {
    setEditMember((prev) => {
      if (!prev) return prev

      return { ...prev, ...part }
    })
  }
  async function getNextMembershipId() {
    setFetchingId(true)
    try {
      const response = await fetch(ENDPOINT.NEXT_MEMBERSHIP_ID)

      const data = await response.json()

      updateEditMember({ membershipId: data })
    } catch (error) {
      console.log(error)
    } finally {
      setFetchingId(false)
    }
  }

  async function handleUpdateMember() {
    if (!editMember) return

    if (!editMember.id) return await handleCreateNewMember()

    try {
      setUpdating(true)
      const response = await fetch(`${ENDPOINT.MEMBER}${editMember.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editMember),
      })
      const newMember = (await response.json()) as Member

      const newData = [...data]
      const index = newData.findIndex((d) => d.id === newMember.id)
      if (index) newData.splice(index, 1, newMember)

      mutate(newData)

      setEditMember(undefined)
      setShowDeleteWarning(false)
      setUpdating(false)
    } catch (e) {
      console.log(e)
    }
  }
  async function handleDeleteMember() {
    if (!editMember || !editMember.id) return

    try {
      setUpdating(true)
      const response = await fetch(`${ENDPOINT.MEMBER}${editMember.id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      const newData = [...data]
      const index = newData.findIndex((d) => d.id === editMember.id)
      if (index) newData.splice(index, 1)

      mutate(newData)
      setEditMember(undefined)
      setShowDeleteWarning(false)
      setUpdating(false)
    } catch (e) {
      console.log(e)
    }
  }
  async function isMemberValid() {
    if (!editMember) return false

    return !!editMember.firstName && !!editMember.lastName && !!editMember.username
  }
  async function handleCreateNewMember() {
    if (!editMember) return

    try {
      setUpdating(true)
      const response = await fetch(`${ENDPOINT.MEMBERS}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editMember),
      })
      const newMember = (await response.json()) as Member
      const newData = [...data]

      newData.push(newMember)
      newData.sort((a, b) => a.name.localeCompare(b.name))

      mutate(newData)

      setEditMember(undefined)
      setShowDeleteWarning(false)
      setUpdating(false)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Stack spacing={1} sx={{ pb: { xs: 8, md: 2 } }}>
      <Paper>
        <SearchToolbar
          title={memberTitle}
          onSearchChange={setMembershipSearchTerm}
          hideSearch={isLoading}
        />
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <LinearProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 56 }} />
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Years Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <IconButton onClick={() => setEditMember({ ...m })}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Link href={`/member/${m.id}`} target='_blank'>
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell>{m.joined}</TableCell>
                    <TableCell>{m.yearsActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Paper>
        <SearchToolbar
          title={inactiveTitle}
          onSearchChange={setInactiveSearchTerm}
          hideSearch={isLoading}
        />
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            <LinearProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 56 }} />
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Last Year</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inactiveMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <IconButton onClick={() => setEditMember({ ...m })}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Link href={`/member/${m.id}`} target='_blank'>
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell>{m.lastPaidDues}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <ResponsiveDialog
        title={
          isCreatingMember
            ? 'Create New Member'
            : `${showDeleteWarning ? 'Delete' : 'Edit'} ${editMember?.name}`
        }
        open={dialogOpen}
        onClose={() => {
          setShowDeleteWarning(false)
          setEditMember(undefined)
        }}
        maxWidth='md'
        actions={
          showDeleteWarning ? (
            <React.Fragment>
              <Button
                disabled={updating}
                color='inherit'
                onClick={() => setShowDeleteWarning(false)}
              >
                No
              </Button>
              <LoadingButton loading={updating} onClick={handleDeleteMember}>
                Yes
              </LoadingButton>
            </React.Fragment>
          ) : (
            <Box sx={{ display: 'flex', width: '100%', alignContent: 'center' }}>
              <Box sx={{ flex: 1 }}>
                {!isCreatingMember && (
                  <Button
                    disabled={updating}
                    color='error'
                    onClick={() => setShowDeleteWarning(true)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
              <Button disabled={updating} color='inherit'>
                Cancel
              </Button>
              <LoadingButton
                disabled={!isMemberValid()}
                loading={updating}
                onClick={handleUpdateMember}
              >
                Save
              </LoadingButton>
            </Box>
          )
        }
      >
        {showDeleteWarning && (
          <Alert severity='error'>
            Deleting {editMember?.name ?? 'this member'} will permentally remove them from the
            roster. This action can not be undone. Are you sure you wish to continue.
          </Alert>
        )}
        {!showDeleteWarning && editMember && (
          <Grid container spacing={2}>
            {!isCreatingMember && (
              <Grid xs={12}>
                <Alert severity='info'>If changing the username a relogin will be necessary</Alert>
              </Grid>
            )}
            <Grid xs={12} md={5}>
              <TextDisplay
                label='First Name'
                name='firstName'
                value={editMember.firstName}
                autoComplete='given-name name'
                disabled={updating}
                onChange={handleTextChange}
                editing
                required
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={5}>
              <TextDisplay
                label='Last Name'
                name='lastName'
                autoComplete='family-name name'
                value={editMember.lastName}
                disabled={updating}
                onChange={handleTextChange}
                editing
                required
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={2}>
              <TextDisplay
                label='Suffix'
                name='suffix'
                autoComplete='honorific-suffix'
                value={editMember.suffix}
                editing
                disabled={updating}
                onChange={handleTextChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextDisplay
                label='Nickname'
                name='nickName'
                value={editMember.nickName}
                editing
                disabled={updating}
                autoComplete='nickname'
                onChange={handleTextChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextDisplay
                label='Email'
                name='email'
                value={editMember.email}
                editing
                disabled={updating}
                type='email'
                onChange={handleTextChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <PhoneField
                label='Phone Number'
                name='phoneNumber'
                value={editMember.phoneNumber}
                editing
                disabled={updating}
                autoComplete='tel'
                onChange={handleTextChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextDisplay
                label='Membership Id'
                name='membershipId'
                value={editMember.membershipId}
                editing
                disabled={updating}
                onChange={handleTextChange}
                InputProps={
                  fetchingId
                    ? {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <CircularProgress size={24} />
                          </InputAdornment>
                        ),
                      }
                    : !editMember.membershipId
                    ? {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Tooltip title='Get next MembershipId'>
                              <IconButton onClick={getNextMembershipId}>
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
            <Grid xs={12} md={6}>
              <RoleDisplay
                name='role'
                value={editMember.role}
                editing
                disabled={updating}
                onChange={handleSelectChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6}>
              <OfficeDisplay
                name='office'
                value={editMember.office}
                editing
                disabled={updating}
                onChange={handleSelectChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={editMember.role === ROLE.PROSPECT ? 4 : 6}>
              <DateDisplay
                label='Joined On'
                value={editMember.joined ? moment(editMember.joined, 'MM-DD-YYYY') : null}
                editing
                disabled={updating}
                onChange={handleDateChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={editMember.role === ROLE.PROSPECT ? 4 : 6}>
              <TextDisplay
                label='Username'
                name='username'
                value={editMember.username}
                disabled={updating}
                onChange={handleTextChange}
                editing
                required
                fullWidth
              />
            </Grid>
            {editMember.role === ROLE.PROSPECT && (
              <Grid xs={12} md={editMember.role === ROLE.PROSPECT ? 4 : 6}>
                <TextDisplay
                  label='Canidate Rides'
                  name='rides'
                  value={editMember.rides ? editMember.rides : '0'}
                  type='number'
                  editing
                  onChange={handleTextChange}
                  inputProps={{ min: 0, max: 3 }}
                  fullWidth
                />
              </Grid>
            )}
            <Grid xs={6}>
              <FormControlLabel
                disabled={updating}
                control={
                  <Checkbox
                    name='isLifeTimeMember'
                    checked={editMember.isLifeTimeMember}
                    onChange={handleCheckboxChange}
                  />
                }
                label='Lifetime Member'
              />
            </Grid>
            <Grid xs={6}>
              <FormControlLabel
                disabled={updating}
                control={
                  <Checkbox
                    name='isPastPresident'
                    checked={editMember.isPastPresident}
                    onChange={handleCheckboxChange}
                  />
                }
                label='Past President'
              />
            </Grid>
            <Grid xs={12}>
              <EntityDisplay
                values={editMember.entity}
                editing
                disabled={updating}
                onChange={handleEntityChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <ImageDisplay
                member={editMember}
                name='image'
                value={editMember.image}
                editing
                disabled={updating}
                onChange={handleTextChange}
                fullWidth
              />
            </Grid>
            <Grid xs={12}>
              <Typography component={'h3'} variant='h5'>
                Emergency Contacts
              </Typography>
            </Grid>
            <Grid xs={6}>
              <TextDisplay
                label='Name'
                name='name'
                value={editMember.emergencyContacts[0].name}
                autoComplete='off'
                editing
                disabled={updating}
                size={'medium'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleEmergencyContactChange(event, 0)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <PhoneField
                label='Phone Number'
                name='phone'
                value={editMember.emergencyContacts[0].phone}
                editing
                disabled={updating}
                size={'medium'}
                autoComplete='off'
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleEmergencyContactChange(event, 0)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <TextDisplay
                label='Name'
                name='name'
                value={editMember.emergencyContacts[1].name}
                autoComplete='off'
                editing
                disabled={updating}
                size={'medium'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleEmergencyContactChange(event, 1)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <PhoneField
                label='Phone Number'
                name='phone'
                value={editMember.emergencyContacts[1].phone}
                editing
                disabled={updating}
                size={'medium'}
                autoComplete='off'
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleEmergencyContactChange(event, 1)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <TextDisplay
                label='Name'
                name='name'
                value={editMember.emergencyContacts[2].name}
                autoComplete='off'
                editing
                disabled={updating}
                size={'medium'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleEmergencyContactChange(event, 2)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={6}>
              <PhoneField
                label='Phone Number'
                name='phone'
                value={editMember.emergencyContacts[2].phone}
                editing
                disabled={updating}
                size={'medium'}
                autoComplete='off'
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleEmergencyContactChange(event, 2)
                }
                fullWidth
              />
            </Grid>
          </Grid>
        )}
      </ResponsiveDialog>
      {!isLoading && (
        <Fab
          variant='extended'
          color='primary'
          sx={{ position: 'fixed', bottom: 8, right: 16 }}
          onClick={() => {
            setEditMember({
              id: '',
              email: '',
              entity: [],
              firstName: '',
              image: '',
              isActive: false,
              isLifeTimeMember: false,
              isPastPresident: false,
              joined: '',
              lastName: '',
              membershipId: '',
              name: '',
              nickName: '',
              office: undefined,
              phoneNumber: '',
              rides: 0,
              role: ROLE.PROSPECT,
              suffix: '',
              yearsActive: null,
              lastPaidDues: undefined,
              username: '',
              emergencyContacts: [
                { name: '', phone: '' },
                { name: '', phone: '' },
                { name: '', phone: '' },
              ],
            })
          }}
        >
          <PersonAddIcon sx={{ mr: 1 }} />
          Add Member
        </Fab>
      )}
    </Stack>
  )
}
