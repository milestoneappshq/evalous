"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';



export async function saveCustomAssessment(
  name: string, 
  description: string, 
  questions: any[], 
  orgId: string // The test belongs to this org
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' };
  }

  // RBAC Enforcement (Wait, they must be an ADMIN to create a test in this org)
  // Check membership in DB
  const membership = await prisma.organizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId
      }
    }
  });

  if (!membership || membership.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden. You must be an ADMIN of this organization to create assessments.' };
  }

  try {
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newTest = await prisma.test.create({
      data: {
        name,
        slug,
        description,
        orgId,
        isCustom: true,
        questions: {
          create: questions.map((q: any, i: number) => ({
            text: q.text,
            type: 'MULTIPLE_CHOICE',
            order: i,
            options: {
              create: q.options.map((opt: any) => ({
                text: opt.text,
                isCorrect: opt.isCorrect
              }))
            }
          }))
        }
      }
    });

    revalidatePath('/dashboard');
    return { success: true, slug: newTest.slug };
  } catch (error) {
    console.error("Save custom test error:", error);
    return { success: false, error: 'Failed to save test.' };
  }
}
