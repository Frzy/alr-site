import type { Member } from '@/types/common'

interface MemberListProps {
  members: Member[]
}

export default function MemberList({ members }: MemberListProps): JSX.Element {
  return <div>List</div>
}
