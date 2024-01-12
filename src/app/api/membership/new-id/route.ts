import { getServerAuthSession } from '@/lib/auth'
import { getNextAlrIDNumber } from '@/lib/member'
import { isMemberAdmin } from '@/utils/member'

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } },
): Promise<Response> {
  const session = await getServerAuthSession()
  const isAdmin = isMemberAdmin(session?.user)

  if (!session) return Response.json(null, { status: 401, statusText: 'Unauthenticated' })
  if (!isAdmin) return Response.json(null, { status: 403, statusText: 'Forbidden' })

  const nextId = await getNextAlrIDNumber()

  return Response.json(nextId)
}
