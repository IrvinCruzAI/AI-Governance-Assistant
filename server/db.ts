import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, initiatives, messages, votes, InsertInitiative, InsertMessage, InsertVote } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Initiative queries
export async function createInitiative(data: InsertInitiative) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(initiatives).values(data);
  return result[0].insertId;
}

export async function getInitiativeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(initiatives).where(eq(initiatives.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserInitiatives(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(initiatives)
    .where(eq(initiatives.userId, userId))
    .orderBy(desc(initiatives.updatedAt));
}

export async function updateInitiative(id: number, data: Partial<InsertInitiative>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(initiatives).set(data).where(eq(initiatives.id, id));
}

// Message queries
export async function addMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getInitiativeMessages(initiativeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages)
    .where(eq(messages.initiativeId, initiativeId))
    .orderBy(messages.createdAt);
}

// Admin queries
export async function getAllInitiatives() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(initiatives)
    .orderBy(desc(initiatives.updatedAt));
}

export async function getAnalytics() {
  const db = await getDb();
  if (!db) return {
    totalSubmissions: 0,
    byRiskLevel: { Low: 0, Medium: 0, High: 0 },
    byArea: {},
    byStatus: { pending: 0, 'under-review': 0, approved: 0, rejected: 0 },
  };
  
  const allInitiatives = await db.select().from(initiatives);
  
  const totalSubmissions = allInitiatives.length;
  const byRiskLevel = { Low: 0, Medium: 0, High: 0 };
  const byArea: Record<string, number> = {};
  const byStatus = { pending: 0, 'under-review': 0, approved: 0, rejected: 0 };
  
  allInitiatives.forEach(initiative => {
    if (initiative.riskLevel) {
      byRiskLevel[initiative.riskLevel as 'Low' | 'Medium' | 'High']++;
    }
    if (initiative.area) {
      byArea[initiative.area] = (byArea[initiative.area] || 0) + 1;
    }
    if (initiative.status) {
      byStatus[initiative.status as 'pending' | 'under-review' | 'approved' | 'rejected']++;
    }
  });
  
  return {
    totalSubmissions,
    byRiskLevel,
    byArea,
    byStatus,
  };
}

export async function updateInitiativeStatus(id: number, status: string, adminNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }
  
  await db.update(initiatives).set(updateData).where(eq(initiatives.id, id));
}

export async function deleteInitiative(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(initiatives).where(eq(initiatives.id, id));
}

// Voting queries
export async function addVote(data: InsertVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already voted for this initiative
  const existing = await db.select().from(votes)
    .where(and(
      eq(votes.initiativeId, data.initiativeId),
      eq(votes.userId, data.userId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("User already voted for this initiative");
  }
  
  const result = await db.insert(votes).values(data);
  return result[0].insertId;
}

export async function removeVote(initiativeId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(votes)
    .where(and(
      eq(votes.initiativeId, initiativeId),
      eq(votes.userId, userId)
    ));
}

export async function getVoteCount(initiativeId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(votes)
    .where(eq(votes.initiativeId, initiativeId));
  
  return result.length;
}

export async function hasUserVoted(initiativeId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(votes)
    .where(and(
      eq(votes.initiativeId, initiativeId),
      eq(votes.userId, userId)
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function getAllInitiativesWithVotes() {
  const db = await getDb();
  if (!db) return [];
  
  const allInitiatives = await db.select().from(initiatives)
    .orderBy(desc(initiatives.updatedAt));
  
  // Get vote counts for each initiative
  const initiativesWithVotes = await Promise.all(
    allInitiatives.map(async (initiative) => {
      const voteCount = await getVoteCount(initiative.id);
      return { ...initiative, voteCount };
    })
  );
  
  // Sort by vote count descending
  return initiativesWithVotes.sort((a, b) => b.voteCount - a.voteCount);
}

// Roadmap status queries
export async function updateRoadmapStatus(id: number, roadmapStatus: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(initiatives).set({ roadmapStatus: roadmapStatus as any }).where(eq(initiatives.id, id));
}

export async function getInitiativesByRoadmapStatus(roadmapStatus: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(initiatives)
    .where(eq(initiatives.roadmapStatus, roadmapStatus as any))
    .orderBy(desc(initiatives.updatedAt));
}


/**
 * Calculate priority score and quadrant based on impact and feasibility
 * Following the Opportunity Cost Framework
 */
export function calculatePriority(initiative: {
  impactScale?: string | null;
  impactBenefitType?: string | null;
  impactFinancialReturn?: string | null;
  feasibilityComplexity?: string | null;
  feasibilityTimeline?: string | null;
  feasibilityDependencies?: string | null;
  missionAlignmentRating?: string | null;
}): {
  impactScore: number;
  feasibilityScore: number;
  priorityScore: number;
  priorityQuadrant: 'quick-win' | 'strategic-bet' | 'nice-to-have' | 'reconsider';
} {
  // Impact Score (0-85)
  let impactScore = 0;
  
  // 1. Scale (0-30)
  if (initiative.impactScale === 'large') impactScore += 30;
  else if (initiative.impactScale === 'medium') impactScore += 20;
  else if (initiative.impactScale === 'small') impactScore += 10;
  
  // 2. Benefit Type (0-30)
  if (initiative.impactBenefitType === 'patient-safety') impactScore += 30;
  else if (initiative.impactBenefitType === 'patient-outcomes') impactScore += 25;
  else if (initiative.impactBenefitType === 'staff-efficiency') impactScore += 20;
  else if (initiative.impactBenefitType === 'cost-reduction') impactScore += 20;
  else if (initiative.impactBenefitType === 'experience') impactScore += 15;
  
  // 3. Financial Return (0-25)
  if (initiative.impactFinancialReturn === 'high') impactScore += 25;
  else if (initiative.impactFinancialReturn === 'some') impactScore += 15;
  else if (initiative.impactFinancialReturn === 'minimal') impactScore += 5;
  
  // Feasibility Score (0-95)
  let feasibilityScore = 0;
  
  // 1. Complexity (0-35)
  if (initiative.feasibilityComplexity === 'simple') feasibilityScore += 10;
  else if (initiative.feasibilityComplexity === 'moderate') feasibilityScore += 20;
  else if (initiative.feasibilityComplexity === 'complex') feasibilityScore += 35;
  
  // 2. Timeline (0-30)
  if (initiative.feasibilityTimeline === 'quick') feasibilityScore += 5;
  else if (initiative.feasibilityTimeline === 'standard') feasibilityScore += 15;
  else if (initiative.feasibilityTimeline === 'long') feasibilityScore += 30;
  
  // 3. Dependencies (0-30)
  if (initiative.feasibilityDependencies === 'ready') feasibilityScore += 5;
  else if (initiative.feasibilityDependencies === 'minor') feasibilityScore += 15;
  else if (initiative.feasibilityDependencies === 'major') feasibilityScore += 30;
  
  // Priority Score = (Impact × 2) - Feasibility
  // Range: -95 to 170
  const priorityScore = (impactScore * 2) - feasibilityScore;
  
  // Determine Quadrant
  let priorityQuadrant: 'quick-win' | 'strategic-bet' | 'nice-to-have' | 'reconsider';
  
  const highImpact = impactScore > 60;
  const lowFeasibility = feasibilityScore < 50;
  
  if (highImpact && lowFeasibility) {
    priorityQuadrant = 'quick-win';
  } else if (highImpact && !lowFeasibility) {
    priorityQuadrant = 'strategic-bet';
  } else if (!highImpact && lowFeasibility) {
    priorityQuadrant = 'nice-to-have';
  } else {
    priorityQuadrant = 'reconsider';
  }
  
  return {
    impactScore,
    feasibilityScore,
    priorityScore,
    priorityQuadrant
  };
}


// Priority evaluation
export async function updatePriorityEvaluation(
  id: number,
  evaluation: {
    impactScale?: string;
    impactBenefitType?: string;
    impactFinancialReturn?: string;
    feasibilityComplexity?: string;
    feasibilityTimeline?: string;
    feasibilityDependencies?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current initiative to calculate priority
  const current = await db.select().from(initiatives).where(eq(initiatives.id, id)).limit(1);
  if (current.length === 0) throw new Error("Initiative not found");
  
  // Merge current values with new evaluation
  const merged = {
    ...current[0],
    ...evaluation
  };
  
  // Calculate priority scores
  const priority = calculatePriority(merged);
  
  // Update initiative with evaluation and calculated scores
  const updateData: any = {
    ...evaluation,
    impactScore: priority.impactScore,
    feasibilityScore: priority.feasibilityScore,
    priorityScore: priority.priorityScore,
    priorityQuadrant: priority.priorityQuadrant
  };
  
  await db.update(initiatives).set(updateData).where(eq(initiatives.id, id));
}
