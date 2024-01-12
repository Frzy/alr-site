import { ACTIVE_ROLES } from '@/utils/constants'
import { findMember } from './member'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession, type Session, type NextAuthOptions } from 'next-auth'
import { memberToSessionUser } from '@/utils/member'

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
            ACTIVE_ROLES.includes(member.role) &&
            passwordToMatch.toLowerCase() === credentials.password.toLowerCase()
          )
        })

        if (member) {
          // Any object returned will be saved in `user` property of the JWT
          return memberToSessionUser(member)
        }

        // If you return null then an error will be displayed advising the user to check their details.
        return null
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
    jwt: ({ token, trigger, user, session, account, profile }) => {
      console.log({ token, trigger, user, session, account, profile })
      // user is not always defined as stated in the type of nextAuth
      if (user) {
        return {
          ...token,
          ...user,
        }
      } else if (trigger === 'update' && Boolean(session)) {
        return {
          ...token,
          ...session,
        }
      }

      return token
    },
  },
}

export async function getServerAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}
