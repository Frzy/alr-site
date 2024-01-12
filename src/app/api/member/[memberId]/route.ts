import { findMember, memberToUnAuthMember, updateMember } from '@/lib/member'
import { getServerAuthSession } from '@/lib/auth'
import type { Member } from '@/types/common'

export async function GET(
  request: Request,
  { params }: { params: { memberId: string } },
): Promise<Response> {
  const { memberId } = params
  const session = await getServerAuthSession()
  const member = await findMember((m) => m.id === memberId)

  if (!member) return Response.json(null, { status: 404, statusText: 'Member no found' })

  return Response.json(session ? member : memberToUnAuthMember(member))
}

export async function PUT(
  request: Request,
  { params }: { params: { memberId: string } },
): Promise<Response> {
  const { memberId } = params
  const session = await getServerAuthSession()
  // Return if not authenticated
  if (!session?.user) return Response.json(null, { status: 401, statusText: 'Unauthenticated' })
  // Return if not admin and updating a profile that is not the session user
  if (!session.user.isAdmin && session.user.id !== memberId) {
    return Response.json(null, { status: 403, statusText: 'Forbidden' })
  }

  const requestBody = (await request.json()) as Member

  try {
    const member = await updateMember(requestBody)

    if (!member) Response.json(null, { status: 404, statusText: 'Member not found' })

    return Response.json(member)
  } catch (e) {
    return Response.json(null, { status: 400, statusText: 'Unable to process request' })
  }
}
