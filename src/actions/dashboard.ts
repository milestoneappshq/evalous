"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

/**
 * Returns summary statistics for an organization.
 * Used by ORG_ADMIN dashboard.
 */
export async function getOrgStats(orgId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify membership & role
  const membership = await prisma.organizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id as string,
        organizationId: orgId
      }
    }
  });

  if (!membership || membership.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required.");
  }

  const [totalCandidates, totalAssignments, completedAssignments] = await Promise.all([
    // Counts users who have a membership in this org
    prisma.organizationMembership.count({ where: { organizationId: orgId } }),
    // Counts all test assignments for this org
    prisma.testAssignment.count({ where: { orgId } }),
    // Counts completed assignments
    prisma.testAssignment.count({ where: { orgId, status: "COMPLETED" } })
  ]);

  const completionRate = totalAssignments > 0 
    ? (completedAssignments / totalAssignments) * 100 
    : 0;

  return {
    totalCandidates,
    totalAssignments,
    completedAssignments,
    completionRate: Math.round(completionRate)
  };
}

/**
 * Returns a list of recently completed test assignments.
 */
export async function getRecentActivity(orgId: string, limit = 5) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return await prisma.testAssignment.findMany({
    where: { orgId },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      score: true,
      status: true,
      createdAt: true,
      proctoringFlags: true,
      user: {
        select: { name: true, email: true }
      },
      test: {
        select: { name: true }
      }
    }
  });
}

/**
 * Aggregates average scores per test slug for the organization.
 */
export async function getScoreAverages(orgId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const results = await prisma.testAssignment.groupBy({
    by: ['testId'],
    where: { 
      orgId, 
      status: "COMPLETED",
      score: { not: null } 
    },
    _avg: {
      score: true
    }
  });

  // Resolve Test names for the charts
  const testIds = results.map(r => r.testId);
  const testNames = await prisma.test.findMany({
    where: { id: { in: testIds } },
    select: { id: true, name: true }
  });

  return results.map(r => ({
    name: testNames.find(t => t.id === r.testId)?.name || "Unknown",
    average: Math.round((r._avg.score || 0) * 10) / 10
  }));
}
