import { getMembersBy } from '@/lib/roster'
import { cache } from 'react'

export const getOfficers = cache(async () => {
  const offices = [
    'Director',
    'Vice Director',
    'Jr Vice',
    'Road Captain',
    'Secretary',
    'Treasurer',
    'Sgt at Arms',
    'Historian',
    'Chaplain',
    'Past Director',
  ]

  const officers = await getMembersBy((m) => !!m.office)

  officers.sort((a, b) => {
    const aIndex = offices.findIndex((o) => o === a.office)
    const bIndex = offices.findIndex((o) => o === b.office)

    if (aIndex > bIndex) return 1
    if (aIndex < bIndex) return -1

    return 0
  })

  return officers
})
