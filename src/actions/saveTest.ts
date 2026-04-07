"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function saveTestResult(
  testSlug: string, 
  score: number, 
  metaData: any, 
  orgId: string,
  proctoringFlags?: any[]
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Must be logged in to save results.' };
  }

  try {
    const testDef = await prisma.test.upsert({
      where: { slug: testSlug },
      update: {},
      create: { slug: testSlug, name: testSlug.toUpperCase() }
    });

    const assignment = await prisma.testAssignment.create({
      data: {
        userId: session.user.id,
        testId: testDef.id,
        orgId: orgId,
        status: 'COMPLETED',
        score: score,
        metaData: metaData,
        proctoringFlags: proctoringFlags || [],
        completedAt: new Date(),
      }
    });

    revalidatePath('/dashboard');
    return { success: true, resultId: assignment.id };
  } catch (error) {
    console.error("Test save error:", error);
    return { success: false, error: 'Failed to save test result.' };
  }
}
