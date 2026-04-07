import { PrismaClient, SystemRole, OrgRole } from '@prisma/client'

const prisma = new PrismaClient()

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

  // 3. Create an Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@acme.com',
      systemRole: SystemRole.USER,
      memberships: {
        create: {
          organizationId: org.id,
          role: OrgRole.ADMIN
        }
      }
    }
  })

  // 4. Create Mock Candidates & Results
  const candidates = [
    { name: 'Alice Smith', email: 'alice@example.com', score: 85 },
    { name: 'Bob Jones', email: 'bob@example.com', score: 72 },
    { name: 'Charlie Brown', email: 'charlie@example.com', score: 94 },
  ]

  const testDef = await prisma.test.findUnique({ where: { slug: 'gcat' } })

  for (const c of candidates) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        memberships: {
          create: {
            organizationId: org.id,
            role: OrgRole.MEMBER
          }
        }
      }
    })

    if (testDef) {
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
