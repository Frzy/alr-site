'use client'

import { useSession } from 'next-auth/react'
import type { Member } from '@/types/common'
import React from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import store from 'storejs'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { type ACTIVITY_TYPE, ACTIVITY_TYPES } from '@/utils/constants'
import { LoadingButton } from '@mui/lab'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { SendNotification } from '@/utils/helpers'

interface ActivityLogFormProps {
  activityName?: string
  activityType?: string
  date?: string
  hours?: number
  miles?: number
  monies?: number
  selectedMembers?: Member[]
  members: Member[]
  fromCalendar?: boolean
}

interface ActivityLog {
  activityName: string
  activityType: string
  date: Dayjs | null
  hours?: number
  miles?: number
  monies?: number
  selectedMembers: Member[]
}

const BASE_STATE = {
  activityName: '',
  activityType: '',
  date: dayjs(),
  hours: undefined,
  miles: undefined,
  monies: undefined,
  selectedMembers: [],
}

export default function ActivityLogForm({
  activityName: initActivityName = '',
  activityType: initActivityType = '',
  date: initDate,
  fromCalendar,
  hours: initHours,
  members,
  miles: initMiles,
  monies: initMonies,
  selectedMembers: initSelectedMembers = [],
}: ActivityLogFormProps): JSX.Element {
  const { data: session, status } = useSession()
  const [state, setState] = React.useState<ActivityLog>({
    activityName: initActivityName,
    activityType: initActivityType,
    date: initDate ? dayjs(initDate) : null,
    hours: initHours,
    miles: initMiles,
    monies: initMonies,
    selectedMembers: initSelectedMembers,
  })
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

  function isValid(): boolean {
    const { selectedMembers, date, hours, miles, monies, activityName, activityType } = state
    let hasError = false
    const e = {
      selectedMembers: !selectedMembers.length,
      activityName: !activityName,
      activityType: !activityType,
      hours: hours === undefined || (hours !== undefined && (isNaN(hours) || hours <= 0)),
      miles: miles !== undefined && (isNaN(miles) || miles < 0),
      monies: monies !== undefined && (isNaN(monies) || monies < 0),
      date: !date || date.isAfter(dayjs().endOf('day')),
    }

    for (const [, value] of Object.entries(e)) {
      if (value) hasError = true
    }

    setErrors(e)

    return !hasError
  }
  function updateState(data: Partial<ActivityLog>): void {
    setState((prev) => ({ ...prev, ...data }))
  }
  function resetForm(): void {
    updateState({ ...BASE_STATE, selectedMembers: state.selectedMembers })
  }

  async function handleSubmit(): Promise<void> {
    const { selectedMembers, date, hours, miles, monies, activityName, activityType } = state

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
        setHasLocalStoreage(true)
        setSaveMember(false)
      }

      try {
        await fetch('/api/activity-log', {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        resetForm()
        SendNotification('Log entry created', 'success')
      } catch (error) {
        SendNotification('Failed to creat log entry', 'error')
      } finally {
        setLoading(false)
      }
    }
  }
  function handleClearRemembered(): void {
    store.remove('_savedLogMembers')
    setHasLocalStoreage(false)
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
        updateState({ selectedMembers: foundMembers })
      }
      setHasLocalStoreage(true)
    } else if (session?.user) {
      const loggedInUser = members.find((m) => m.id === session.user.id)

      if (loggedInUser) updateState({ selectedMembers: [loggedInUser] })
    }
  }, [members, session, status])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {fromCalendar && (
            <Grid xs={12}>
              <Typography>
                Thank you for attending the ALR function {state.activityName}. We have tried to fill
                out the activity form below as best we could based on the event. Please review the
                information below before submission.
              </Typography>
              {!!session?.user && !session.user.milesToPost && (
                <Alert severity='info'>
                  <AlertTitle>Mile Accuracy</AlertTitle>
                  We have noticed that you do not have your home to post mileage saved on your
                  profile. Be sure to add those miles below for a more accurate log entry. If you
                  would like to update your profile click <Link href='/profile'>here</Link>.
                </Alert>
              )}
            </Grid>
          )}
          <Grid xs={12} md={10}>
            <Autocomplete
              options={members}
              multiple
              isOptionEqualToValue={(member, value) => {
                return member.id === value.id
              }}
              value={state.selectedMembers}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, selectedMembers: false }))
              }}
              onChange={(event, values, reason, details) => {
                updateState({ selectedMembers: values })
              }}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => {
                  const label = `${option.name} [ ${[option?.entity ?? [], 'ALR']
                    .toSorted()
                    .join(' | ')} ]`
                  return <Chip {...getTagProps({ index })} key={index} label={label} />
                })
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
              value={state.date}
              disabled={loading}
              sx={{ width: '100%' }}
              slotProps={{
                textField: {
                  onFocus: () => {
                    setErrors((prev) => ({ ...prev, date: false }))
                  },
                  error: errors.date ? true : undefined,
                },
              }}
              disableFuture
              onChange={(value) => {
                updateState({ date: value })
              }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              label='Activity Name'
              fullWidth
              disabled={loading}
              value={state.activityName}
              error={errors.activityName}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, activityName: false }))
              }}
              onChange={(event) => {
                const { value } = event.target

                updateState({ activityName: value })
              }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <FormControl
              fullWidth
              error={errors.activityType}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, activityType: false }))
              }}
              disabled={loading}
            >
              <InputLabel id='activity-log-type-label'>Activity Type</InputLabel>
              <Select
                labelId='activity-log-type-label'
                id='activity-log-type'
                label='Activity Type'
                value={state.activityType}
                onChange={(event) => {
                  const { value } = event.target

                  updateState({ activityType: value as ACTIVITY_TYPE })
                }}
              >
                {ACTIVITY_TYPES.map((a, i) => (
                  <MenuItem key={i} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              label='Hours'
              type='number'
              fullWidth
              error={errors.hours}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, hours: false }))
              }}
              helperText={errors.hours ? 'Hours must be a NUMBER greater than ZERO' : undefined}
              value={state.hours ?? ''}
              disabled={loading}
              onChange={(event) => {
                const { value } = event.target
                const parsed = parseFloat(value)

                updateState({
                  hours: isNaN(parsed) || parsed === 0 ? undefined : Math.floor(parsed * 10) / 10,
                })
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              label='Miles'
              type='number'
              error={errors.miles}
              helperText={errors.miles ? 'Hours must be a NUMBER greater than ZERO' : undefined}
              fullWidth
              value={state.miles ?? ''}
              disabled={loading}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, miles: false }))
              }}
              onChange={(event) => {
                const { value } = event.target
                const parsed = parseFloat(value)

                updateState({
                  miles: isNaN(parsed) || parsed === 0 ? undefined : Math.floor(parsed * 10) / 10,
                })
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
              value={state.monies ?? ''}
              disabled={loading}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, monies: false }))
              }}
              onChange={(event) => {
                const { value } = event.target
                const parsed = parseFloat(value)

                updateState({
                  monies:
                    isNaN(parsed) || parsed === 0 ? undefined : Math.floor(parsed * 100) / 100,
                })
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
            <Grid xs={6} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleClearRemembered} disabled={loading}>
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
  )
}
