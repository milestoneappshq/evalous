import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/lib/prisma';
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)


export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || "a_very_secure_randomly_generated_auth_secret_for_local_testing",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // --- Scaffolding for Social Logins (Requires Env Vars) ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    // --- MVP Local Testing Provider ---
    Credentials({
      name: "Standard Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@company.com" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        
        // Find existing user or mock for testing
        const user = await prisma.user.findUnique({
          where: { email },
          include: { memberships: true }
        });

        if (user) {
           return { id: user.id, name: user.name, email: user.email, systemRole: user.systemRole };
        }

        // Mock Fallback if user doesn't exist yet but testing locally
        if (email === "superadmin@platform.com") {
          return { id: "0", name: "Super Admin", email, systemRole: "SUPER_ADMIN" }
        }
        return { id: "mock-1", name: "Mock User", email, systemRole: "USER" }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.systemRole = (user as any).systemRole || "USER"
        token.id = user.id
      }
      // Allow client to update active organization in session
      if (trigger === "update" && session?.activeOrgId) {
        token.activeOrgId = session.activeOrgId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).systemRole = token.systemRole as string;
        // We inject the active organization context into the session
        (session.user as any).activeOrgId = token.activeOrgId || null;
      }
      return session
    }
  }
})
