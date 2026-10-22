import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
})
