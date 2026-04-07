"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

/**
 * Enhanced: Processes CSV data to create users, link to an organization,
 * assign a test, and send an email invitation.
 */
export async function processBulkCandidates(
  candidates: { email: string; name: string }[], 
  orgId: string,
  testId?: string // Optional: The test to assign and invite them to
) {
  try {
    const results = { created: 0, existEnrolled: 0, errors: 0, invitesSent: 0 };

    for (const candidate of candidates) {
      if (!candidate.email) {
        results.errors++;
        continue;
      }

      // 1. Find or create user
      let user = await prisma.user.findUnique({
        where: { email: candidate.email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: candidate.email,
            name: candidate.name,
            systemRole: 'USER',
          }
        });
        results.created++;
      } else {
        results.existEnrolled++;
      }

      // 2. Upsert membership
      await prisma.organizationMembership.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: orgId
          }
        },
        update: {}, 
        create: {
          userId: user.id,
          organizationId: orgId,
          role: 'CLIENT' 
        }
      });

      // 3. Assign Test & Send Invite (if testId provided)
      if (testId) {
        try {
          // Check if already assigned to this exact test/org
          const existingAssignment = await prisma.testAssignment.findFirst({
            where: { userId: user.id, testId: testId, orgId: orgId }
          });

          if (!existingAssignment) {
            await prisma.testAssignment.create({
              data: {
                userId: user.id,
                testId: testId,
                orgId: orgId,
                status: 'PENDING'
              }
            });

            // 4. Send Email Invitation
            // Note: In production, use a secure unique token. 
            // For now, we point to the generic runner.
            const inviteUrl = `${process.env.NEXTAUTH_URL}/dashboard`; 
            
            await sendEmail({
              to: user.email!,
              subject: "Invitation to Assessment",
              text: `Hello ${user.name},\n\nYou have been invited to complete an assessment. Please log in to your dashboard to begin: ${inviteUrl}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                  <h2>Assessment Invitation</h2>
                  <p>Hello <strong>${user.name}</strong>,</p>
                  <p>You have been assigned a new evaluation by the hiring team. Your results will be saved securely within the platform.</p>
                  <a href="${inviteUrl}" style="background: #10b981; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px;">
                    Enter Assessment Portal
                  </a>
                </div>
              `
            });
            results.invitesSent++;
          }
        } catch (inviteError) {
          console.error("Invite error for candidate", candidate.email, inviteError);
        }
      }
    }

    revalidatePath('/dashboard');
    return { success: true, results };
  } catch (error) {
    console.error("Bulk upload error:", error);
    return { success: false, error: "Failed to process candidates." };
  }
}

