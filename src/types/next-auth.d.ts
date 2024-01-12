import type { SessionUser } from '@/types/common'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: SessionUser
  }

  interface User extends SessionUser {}
}
