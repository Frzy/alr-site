'use client'

import * as React from 'react'
import Paper from '@mui/material/Paper'
import MemberListHeader, { BASE_FILTERS, FILTER, type ListFilter } from './Header'
import type { ListMode, Member } from '@/types/common'
import MemberList from './List'
import MemberGridList from './Grid'
import { CANIDATE_ROLES, MEMBER_ROLES } from '@/utils/constants'
import FuzzySearch from 'fuzzy-search'
import { debounce } from '@mui/material'

interface MemeberViewerProps {
  members: Member[]
}

export default function MemberViewer({ members: initMembers }: MemeberViewerProps): JSX.Element {
  const [listMode, setListMode] = React.useState<ListMode>('grid')
  const [filters, setFilters] = React.useState<ListFilter>(BASE_FILTERS)
  const members = React.useMemo(() => {
    let filteredMembers = initMembers.filter((m) => {
      let match = true

      if (match && filters.group === 'officers') match = !!m.office
      if (match && filters.group === 'members') match = MEMBER_ROLES.includes(m.role)
      if (match && filters.group === 'candidates') match = CANIDATE_ROLES.includes(m.role)
      if (match && filters.role.length) match = filters.role.includes(m.role)
      if (match && filters.entity.length) match = filters.entity.some((e) => m.entity?.includes(e))
      if (match && filters.lifetimeMember) match = m.isLifeTimeMember
      if (match && filters.pastPresident) match = m.isPastPresident

      return match
    })

    if (filters.query) {
      const searcher = new FuzzySearch(filteredMembers, ['name', 'nickName'])

      filteredMembers = searcher.search(filters.query)
    }

    if (filters.sortBy !== 'name') {
      const isDesc = filters.sortBy.charAt(0) === '-'
      const sortByName = isDesc
        ? (filters.sortBy.slice(1) as keyof Member)
        : (filters.sortBy as keyof Member)

      filteredMembers = filteredMembers.toSorted((a, b) => {
        const result = (a[sortByName]?.toString() ?? '').localeCompare(
          b[sortByName]?.toString() ?? '',
        )

        return isDesc ? -1 * result : result
      })
    }

    return filteredMembers
  }, [initMembers, filters])
  const availableRoles = React.useMemo(() => {
    return initMembers
      .map((m) => m.role)
      .filter((value, index, array) => array.indexOf(value) === index)
  }, [initMembers])
  const avaliableFilters = React.useMemo(() => {
    if (listMode === 'grid') return undefined

    return [FILTER.ENTITY, FILTER.LIFETIME, FILTER.PAST_DIRECTOR, FILTER.ROLE, FILTER.GROUP]
  }, [listMode])

  const updateFilters = debounce(setFilters, 150)

  function handleModeChange(newMode: ListMode): void {
    setListMode(newMode)
  }
  function handleFilterChange(newFilters: ListFilter): void {
    updateFilters(newFilters)
  }

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <MemberListHeader
        listMode={listMode}
        onFilterChange={handleFilterChange}
        onListModeChange={handleModeChange}
        availableRoles={availableRoles}
        filteredTotal={members.length}
        total={initMembers.length}
        filters={avaliableFilters}
      />
      {listMode === 'list' ? (
        <MemberList members={members} />
      ) : (
        <MemberGridList members={members} />
      )}
    </Paper>
  )
}
