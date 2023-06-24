import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { findMember } from './roster'
import { MEMBER_ROLE } from '@/utils/constants'

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        username: {
          label: 'username',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.password || !credentials?.username) return null
        // Add logic here to look up the user from the credentials supplied
        const member = await findMember((member) => {
          const passwordToMatch = member.membershipId
            ? member.membershipId.slice(-4)
            : member.lastName

          return (
            member.username === credentials.username.toLowerCase() &&
            (member.isActive || member.role === MEMBER_ROLE.PROSPECT) &&
            passwordToMatch.toLowerCase() === credentials.password.toLowerCase()
          )
        })

        if (member) {
          // Any object returned will be saved in `user` property of the JWT
          return member
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: token,
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any
        return {
          ...token,
          ...u,
        }
      }
      return token
    },
  },
}
