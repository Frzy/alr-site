'use client'

import { useSession } from 'next-auth/react'
import type { Member } from '@/types/common'
import React from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import store from 'storejs'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import { ACTIVITY_TYPES } from '@/utils/constants'
import { LoadingButton } from '@mui/lab'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function ActivityLogForm({ members }: { members: Member[] }): JSX.Element {
  const { data: session, status } = useSession()
  const [selectedMembers, setSelectedMembers] = React.useState<Member[]>([])
  const [activityName, setActivityName] = React.useState<string>('')
  const [activityType, setActivityType] = React.useState<string>('')
  const [hours, setHours] = React.useState<number>()
  const [miles, setMiles] = React.useState<number>()
  const [monies, setMonies] = React.useState<number>()
  const [date, setDate] = React.useState<Dayjs | null>(dayjs())
  const [saveMembers, setSaveMember] = React.useState(false)
  const [hasLocalStorage, setHasLocalStoreage] = React.useState(false)
  const [networkError, setNetworkError] = React.useState<unknown | null>(null)
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
    let hasError = false
    const e = {
      selectedMembers: !selectedMembers.length,
      activityName: !activityName,
      activityType: !activityType,
      hours: hours !== undefined && hours >= 0,
      miles: miles !== undefined && !!isNaN(miles) && miles >= 0,
      monies: monies !== undefined && !!(isNaN(monies) || monies <= 0),
      date: !date || date.isAfter(dayjs().endOf('day')),
    }

    for (const [, value] of Object.entries(e)) {
      if (value) hasError = true
    }

    setErrors(e)

    return !hasError
  }

  async function handleSubmit(): Promise<void> {
    if (isValid()) {
      setLoading(true)
      setNetworkError(null)

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
        await fetch('/api/activity-log', {
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
        setDate(dayjs())
      } catch (error) {
        setNetworkError(error)
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
    } else if (session?.user) {
      const loggedInUser = members.find((m) => m.id === session.user.id)

      if (loggedInUser) setSelectedMembers([loggedInUser])
    }
  }, [members, session, status])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={10}>
            <Autocomplete
              options={members}
              multiple
              isOptionEqualToValue={(member, value) => {
                return member.id === value.id
              }}
              value={selectedMembers}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, selectedMembers: false }))
              }}
              onChange={(event, values, reason, details) => {
                setSelectedMembers(values)
              }}
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => {
                  const {key, ...props} = getTagProps{{index}}
                  return <Chip key={key} variant='outlined' label={option} {...props} />
                })
              }
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
                  onFocus: () => {
                    setErrors((prev) => ({ ...prev, date: false }))
                  },
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
              onFocus={() => {
                setErrors((prev) => ({ ...prev, activityName: false }))
              }}
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
                value={activityType}
                onChange={(event) => {
                  const { value } = event.target

                  setActivityType(value)
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
              value={hours ?? ''}
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
              value={miles ?? ''}
              disabled={loading}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, miles: false }))
              }}
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
              value={monies ?? ''}
              disabled={loading}
              onFocus={() => {
                setErrors((prev) => ({ ...prev, monies: false }))
              }}
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
            <Grid xs={6} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'flex-end' }}>
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
  )
}
