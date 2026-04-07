"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function getAvailableTests(orgId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Fetch tests that are either GLOBAL (no orgId) or specific to THIS org
  return await prisma.test.findMany({
    where: {
      OR: [
        { orgId: null },
        { orgId: orgId }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isCustom: true
    },
    orderBy: { name: 'asc' }
  });
}
