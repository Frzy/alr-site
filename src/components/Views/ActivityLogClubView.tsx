'use client'

import * as React from 'react'
import BaseLayout from '@/components/BaseLayout'
import type { ActivityLogStats } from '@/types/common'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import dayjs from 'dayjs'
import LatestActivityLogs from '../Activity Log/Latest'
import ClubStats from '../Activity Log/ClubStats'

interface ActivityLogClubViewProps {
  serverStats: ActivityLogStats
}

export default function ActivityLogClubView({
  serverStats,
}: ActivityLogClubViewProps): JSX.Element {
  const topRiders = React.useMemo(() => {
    return serverStats.entriesByMember
      .toSorted((a, b) => b.breakdown.Ride.events - a.breakdown.Ride.events)
      .slice(0, 5)
  }, [serverStats])
  const topActive = React.useMemo(() => {
    return serverStats.entriesByMember.toSorted((a, b) => b.events - a.events).slice(0, 5)
  }, [serverStats])
  const topMiles = React.useMemo(() => {
    return serverStats.entriesByMember.toSorted((a, b) => b.miles - a.miles).slice(0, 5)
  }, [serverStats])
  const topHours = React.useMemo(() => {
    return serverStats.entriesByMember.toSorted((a, b) => b.hours - a.hours).slice(0, 5)
  }, [serverStats])

  return (
    <BaseLayout title='ALR 91 Activity Stats'>
      <Paper>
        <LatestActivityLogs logs={serverStats.latestEntries} />
      </Paper>
      <Paper>
        <ClubStats stats={serverStats} />
      </Paper>
    </BaseLayout>
  )
}
