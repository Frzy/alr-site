import * as React from 'react'
import { ACTIVE_ROLES, ENDPOINT } from '@/utils/constants'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { getMembersBy } from '@/lib/roster'
import { useSession } from 'next-auth/react'
import Grid from '@mui/material/Unstable_Grid2'
import Head from 'next/head'
import Header from '@/component/header'
import store from 'storejs'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Typography,
  Paper,
  Select,
  TextField,
} from '@mui/material'
import type { GetServerSideProps } from 'next'
import type { Member } from '@/types/common'
import moment, { Moment } from 'moment'
import { LoadingButton } from '@mui/lab'

interface ActivityLogPageProps {
  members: Member[]
}

export const getServerSideProps: GetServerSideProps<ActivityLogPageProps> = async () => {
  const members = await getMembersBy((m) => ACTIVE_ROLES.indexOf(m.role) !== -1)

  if (members)
    members.sort((a, b) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1

      return 0
    })
  return {
    props: { members },
  }
}

export default function ActivityLogPage({ members }: ActivityLogPageProps) {
  const { data, status } = useSession()
  const [selectedMembers, setSelectedMembers] = React.useState<Member[]>([])
  const [activityName, setActivityName] = React.useState<string>('')
  const [activityType, setActivityType] = React.useState<string>('')
  const [hours, setHours] = React.useState<number>()
  const [miles, setMiles] = React.useState<number>()
  const [monies, setMonies] = React.useState<number>()
  const [date, setDate] = React.useState<Moment | null>(moment())
  const [saveMembers, setSaveMember] = React.useState(false)
  const [hasLocalStorage, setHasLocalStoreage] = React.useState(false)
  const [errors, setErrors] = React.useState({
    selectedMembers: false,
    activityName: false,
    activityType: false,
    hours: false,
    miles: false,
    monies: false,
    date: false,
  })
  const [loading, setLoading] = React.useState(false)

  function isValid() {
    let hasError = false
    const e = {
      selectedMembers: !selectedMembers.length,
      activityName: !activityName,
      activityType: !activityType,
      hours: !!(isNaN(hours as number) || (hours as number) <= 0),
      miles: miles !== undefined && !!isNaN(miles as number),
      monies: monies !== undefined && !!(isNaN(monies as number) || (monies as number) <= 0),
      date: !date || date.isAfter(moment().endOf('day')),
    }

    for (let [key, value] of Object.entries(e)) {
      if (value) hasError = true
    }

    setErrors(e)

    return !hasError
  }

  async function handleSubmit() {
    if (isValid()) {
      setLoading(true)
      const payload = {
        members: selectedMembers.map((m) => ({
          name: `${m.lastName}, ${m.firstName}`,
          entity: [...(m?.entity ?? []), 'ALR'],
        })),
        date: date?.format() ?? '',
        hours,
        miles,
        monies,
        activityName,
        activityType,
      }

      if (saveMembers) {
        store.set(
          '_savedLogMembers',
          selectedMembers.map((m) => m.id),
        )
      }

      try {
        await fetch(ENDPOINT.ACTIVITY_LOG, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        setActivityName('')
        setActivityType('')
        setHours(undefined)
        setMiles(undefined)
        setMonies(undefined)
        setDate(moment())
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
  }

  React.useEffect(() => {
    if (store.has('_savedLogMembers')) {
      const ids: string[] = store.get('_savedLogMembers')
      const foundMembers: Member[] = []

      ids.forEach((id) => {
        const found = members.find((m) => m.id === id)
        if (found) foundMembers.push(found)
      })

      if (foundMembers.length) {
        setSelectedMembers(foundMembers)
      }
      setHasLocalStoreage(true)
    } else if (data?.user) {
      const loggedInUser = members.find((m) => m.id === data.user.id)

      if (loggedInUser) setSelectedMembers([loggedInUser])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <React.Fragment>
      <Head>
        <title>ALR 91 - Activity Log</title>
        <meta name='description' content='american legion riders chapter 91 activity log' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/images/alr-logo.png' />
      </Head>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h4' gutterBottom>
            Activity Log Form
          </Typography>
          <Grid container spacing={2}>
            <Grid xs={12} md={10}>
              <Autocomplete
                options={members}
                multiple
                isOptionEqualToValue={(member, value) => {
                  return member.id === value.id
                }}
                value={selectedMembers}
                onFocus={() => setErrors((prev) => ({ ...prev, selectedMembers: false }))}
                onChange={(event, values, reason, details) => {
                  setSelectedMembers(values)
                }}
                disabled={loading}
                getOptionLabel={(m) =>
                  `${m.name} [ ${[...(m?.entity ?? []), 'ALR'].sort().join(' | ')} ]`
                }
                groupBy={(m) => m.name[0].toUpperCase()}
                renderInput={(params) => (
                  <TextField {...params} label='Member(s)' error={errors.selectedMembers} />
                )}
              />
            </Grid>
            <Grid xs={12} md={2}>
              <DatePicker
                label='Date'
                value={date}
                disabled={loading}
                sx={{ width: '100%' }}
                slotProps={{
                  textField: {
                    onFocus: () => setErrors((prev) => ({ ...prev, date: false })),
                    error: errors.date ? true : undefined,
                  },
                }}
                disableFuture
                onChange={(value) => {
                  setDate(value)
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                label='Activity Name'
                fullWidth
                disabled={loading}
                value={activityName}
                error={errors.activityName}
                onFocus={() => setErrors((prev) => ({ ...prev, activityName: false }))}
                onChange={(event) => {
                  const { value } = event.target

                  setActivityName(value)
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl
                fullWidth
                error={errors.activityType}
                onFocus={() => setErrors((prev) => ({ ...prev, activityType: false }))}
                disabled={loading}
              >
                <InputLabel id='activity-log-type-label'>Activity Type</InputLabel>
                <Select
                  labelId='activity-log-type-label'
                  id='activity-log-type'
                  label='Activity Type'
                  value={activityType}
                  onChange={(event) => {
                    const { value } = event.target

                    setActivityType(value)
                  }}
                >
                  <MenuItem value='Event'>Event</MenuItem>
                  <MenuItem value='Meeting'>Meeting</MenuItem>
                  <MenuItem value='Ride'>Ride</MenuItem>
                  <MenuItem value='Other'>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label='Hours'
                type='number'
                fullWidth
                error={errors.hours}
                onFocus={() => setErrors((prev) => ({ ...prev, hours: false }))}
                helperText={errors.hours ? 'Hours must be a NUMBER greater than ZERO' : undefined}
                value={hours || ''}
                disabled={loading}
                onChange={(event) => {
                  const { value } = event.target
                  const parsed = parseFloat(value)

                  setHours(isNaN(parsed) || parsed === 0 ? undefined : Math.floor(parsed * 10) / 10)
                }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label='Miles'
                type='number'
                error={errors.miles}
                helperText={errors.miles ? 'Miles must be a NUMBER' : undefined}
                fullWidth
                value={miles || ''}
                disabled={loading}
                onFocus={() => setErrors((prev) => ({ ...prev, miles: false }))}
                onChange={(event) => {
                  const { value } = event.target
                  const parsed = parseFloat(value)

                  setMiles(isNaN(parsed) || parsed === 0 ? undefined : Math.floor(parsed * 10) / 10)
                }}
              />
            </Grid>
            <Grid xs={12} md={4}>
              <TextField
                label='Monies'
                type='number'
                error={errors.monies}
                helperText={errors.monies ? 'Monies must be a NUMBER greater than ZERO' : undefined}
                fullWidth
                value={monies || ''}
                disabled={loading}
                onFocus={() => setErrors((prev) => ({ ...prev, monies: false }))}
                onChange={(event) => {
                  const { value } = event.target
                  const parsed = parseFloat(value)

                  setMonies(
                    isNaN(parsed) || parsed === 0 ? undefined : Math.floor(parsed * 100) / 100,
                  )
                }}
              />
            </Grid>
            <Grid xs={hasLocalStorage ? 6 : 12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={saveMembers}
                    disabled={loading}
                    onChange={(event) => {
                      const { checked } = event.target
                      setSaveMember(checked)
                    }}
                  />
                }
                label='Remember selected members'
              />
            </Grid>
            {hasLocalStorage && (
              <Grid
                xs={6}
                sx={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}
              >
                <Button onClick={() => store.remove('_savedLogMembers')} disabled={loading}>
                  Clear Remembered
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
        <Box mt={1}>
          <LoadingButton fullWidth variant='contained' loading={loading} onClick={handleSubmit}>
            Submit
          </LoadingButton>
        </Box>
      </LocalizationProvider>
    </React.Fragment>
  )
}
