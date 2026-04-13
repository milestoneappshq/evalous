"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'proctoring');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

    // --- REFACTOR: Process Proctoring Snapshots ---
    const processedFlags = [];
    if (proctoringFlags && proctoringFlags.length > 0) {
      for (const flag of proctoringFlags) {
        if (flag.base64Snapshot && flag.base64Snapshot.startsWith('data:image')) {
          try {
            // 1. Decode base64
            const base64Data = flag.base64Snapshot.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            
            // 2. Create unique filename
            const filename = `snap_${Date.now()}_${uuidv4().substring(0, 8)}.jpg`;
            const filePath = path.join(UPLOAD_DIR, filename);
            
            // 3. Write to disk
            fs.writeFileSync(filePath, buffer);
            
            // 4. Update flag with relative URL instead of massive base64
            processedFlags.push({
              ...flag,
              base64Snapshot: `/uploads/proctoring/${filename}`, // It's now a URL!
              isLocalPath: true
            });
          } catch (err) {
            console.error("Failed to save snapshot to disk:", err);
            processedFlags.push(flag); // Fallback to original
          }
        } else {
          processedFlags.push(flag);
        }
      }
    }

    // Set retention expiry: Current Date + 30 Days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const assignment = await prisma.testAssignment.create({
      data: {
        userId: session.user.id,
        testId: testDef.id,
        orgId: orgId,
        status: 'COMPLETED',
        score: score,
        metaData: metaData,
        proctoringFlags: processedFlags,
        completedAt: new Date(),
        expiresAt: expiresAt
      }
    });

    revalidatePath('/dashboard');
    return { success: true, resultId: assignment.id };
  } catch (error) {
    console.error("Test save error:", error);
    return { success: false, error: 'Failed to save test result.' };
  }
}
