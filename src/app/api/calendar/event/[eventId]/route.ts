import { getCalendarEvent } from '@/lib/calendar'
import type { IServerCalendarEvent } from '@/types/common'
import { mapGoogleToServer } from '@/utils/calendar'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
): Promise<IServerCalendarEvent> {
  const event = await getCalendarEvent({
    eventId: params.slug,
  })

  return mapGoogleToServer(event)
}

// async function DeleteHandle(req: NextApiRequest, res: NextApiResponse) {
//   const { eventId, mode, stopDate } = req.query as { [key: string]: string }

//   if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
//     await deleteFutureCalendarEvents(eventId, stopDate)
//   } else {
//     await deleteCalendarEvent({ eventId })
//   }

//   return null
// }

// async function PutHandle(req: NextApiRequest, res: NextApiResponse) {
//   const { eventId } = req.query as { [key: string]: string }
//   const { mode, stopDate, event } = JSON.parse(req.body)

//   if (mode === RECURRENCE_MODE.FUTURE && stopDate) {
//     return await updateFurtureRecurringEvents(eventId, event, stopDate)
//   }

//   return await updateCalendarEvent({ eventId, requestBody: event }, true)
// }
