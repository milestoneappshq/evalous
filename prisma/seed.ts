import { PrismaClient, SystemRole, OrgRole } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from "bcryptjs"

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })


async function main() {
  console.log('Seeding database...')

  // 1. Create Global Tests
  const tests = [
    { slug: 'reaction-time', name: 'Reaction Time Test', description: 'Measures simple visual reaction speed.' },
    { slug: 'gcat', name: 'General Cognitive Aptitude', description: 'Assesses logic, math, and spatial reasoning.' },
  ]

  for (const t of tests) {
    await prisma.test.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    })
  }

  // 2. Create a Mock Organization
  const org = await prisma.organization.upsert({
    where: { subdomain: 'acme' },
    update: {},
    create: {
      name: 'Acme Recruiting',
      subdomain: 'acme'
    }
  })

  // Generate a standard test password hash: "password123"
  const defaultPassword = await bcrypt.hash('password123', 12);

  // 3. Create a Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@platform.com' },
    update: { password: defaultPassword, systemRole: SystemRole.SUPER_ADMIN },
    create: {
      name: 'Super Admin',
      email: 'superadmin@platform.com',
      password: defaultPassword,
      systemRole: SystemRole.SUPER_ADMIN,
    }
  })

  // 4. Create an Admin User (Organization Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@any.com' },
    update: { password: defaultPassword },
    create: {
      name: 'Company Admin',
      email: 'admin@any.com',
      password: defaultPassword,
      systemRole: SystemRole.USER,
      memberships: {
        create: {
          organizationId: org.id,
          role: OrgRole.ADMIN
        }
      }
    }
  })

  // 5. Create Mock Candidates & Results
  const candidates = [
    { name: 'Test Candidate', email: 'test@candidate.com', score: 85 },
    { name: 'Bob Jones', email: 'bob@example.com', score: 72 },
    { name: 'Charlie Brown', email: 'charlie@example.com', score: 94 },
  ]

  const testDef = await prisma.test.findUnique({ where: { slug: 'gcat' } })

  for (const c of candidates) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { password: defaultPassword },
      create: {
        name: c.name,
        email: c.email,
        password: defaultPassword,
        // Notice: Candidates do NOT get OrgRole.ADMIN, they are just basic org users or purely candidates without memberships depending on workflow. 
        // For testing, let's keep them as members.
        memberships: {
          create: {
            organizationId: org.id,
            role: OrgRole.MEMBER
          }
        }
      }
    })

    if (testDef) {
      // Check if assignment already exists to prevent crashing seed multiple times
      const existing = await prisma.testAssignment.findFirst({
        where: { userId: user.id }
      })

      if (!existing) {
        await prisma.testAssignment.create({
          data: {
            userId: user.id,
            testId: testDef.id,
            orgId: org.id,
            status: 'COMPLETED',
            score: c.score,
            completedAt: new Date()
          }
        })
      }
    }
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
