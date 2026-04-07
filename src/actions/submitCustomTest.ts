"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { saveTestResult } from '@/actions/saveTest';

const prisma = new PrismaClient();

export async function submitCustomTest(
  slug: string,
  testId: string,
  orgId: string | null,
  answers: Record<string, string>, // Question ID -> Option ID
  proctoringFlags?: { reason: string; base64Snapshot: string; timestamp: Date }[]
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!test) return { success: false, error: 'Test not found.' };

    let score = 0;

    test.questions.forEach((question) => {
      const correctOption = question.options.find(o => o.isCorrect);
      const userSelectedOptionId = answers[question.id];
      
      if (correctOption && userSelectedOptionId === correctOption.id) {
        score += 1;
      }
    });

    const effectiveOrgId = orgId || 'platform_global';
    
    await saveTestResult(slug, score, { answers }, effectiveOrgId, proctoringFlags);

    revalidatePath('/dashboard');
    return { success: true, score };
  } catch (error) {
    console.error("Test submission error:", error);
    return { success: false, error: 'Failed to grade test.' };
  }
}
