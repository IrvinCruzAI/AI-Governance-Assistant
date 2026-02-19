import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, initiatives, InsertInitiative, votes, InsertVote, comments, InsertComment } from "../drizzle/schema";
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

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
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

export async function createUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(users).values(user);
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
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

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPassword(openId: string, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update password: database not available");
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.openId, openId));
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

export async function getUserInitiativesWithVotes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const userInitiatives = await db.select().from(initiatives)
    .where(eq(initiatives.userId, userId))
    .orderBy(desc(initiatives.updatedAt));
  
  // Get vote counts for each initiative
  const initiativesWithVotes = await Promise.all(
    userInitiatives.map(async (initiative) => {
      const voteCount = await getVoteCount(initiative.id);
      return { ...initiative, voteCount };
    })
  );
  
  return initiativesWithVotes;
}

export async function updateInitiative(id: number, data: Partial<InsertInitiative>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(initiatives).set(data).where(eq(initiatives.id, id));
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


// Old calculatePriority function removed - replaced by simplified 3-field system

// Simplified priority evaluation (3 fields: impact, effort, notes)
export async function updatePriorityEvaluation(id: number, evaluation: {
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  evaluationNotes?: string;
  tags?: string[];
  evaluatedBy?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Calculate priority from impact/effort matrix
  const priority = calculateSimplePriority(evaluation.impact, evaluation.effort);
  
  // Update initiative with evaluation and calculated priority
  const updateData: any = {
    impact: evaluation.impact,
    effort: evaluation.effort,
    evaluationNotes: evaluation.evaluationNotes || null,
    tags: evaluation.tags ? JSON.stringify(evaluation.tags) : null,
    priorityScore: priority.score,
    priorityQuadrant: priority.quadrant,
    evaluatedBy: evaluation.evaluatedBy || null,
    evaluatedAt: new Date()
  };
  
  await db.update(initiatives).set(updateData).where(eq(initiatives.id, id));
}

// Calculate priority from simplified impact/effort matrix (Clean 4-Quadrant Model)
function calculateSimplePriority(impact: 'high' | 'medium' | 'low', effort: 'high' | 'medium' | 'low') {
  // Impact scores: high=100, medium=60, low=30
  const impactScore = impact === 'high' ? 100 : impact === 'medium' ? 60 : 30;
  
  // Effort scores: high=100, medium=60, low=30  
  const effortScore = effort === 'high' ? 100 : effort === 'medium' ? 60 : 30;
  
  // Total score (higher is better)
  const score = impactScore + (100 - effortScore); // Impact + (inverse of effort)
  
  // Determine quadrant using clean 4-quadrant model
  let quadrant: 'quick-win' | 'strategic-bet' | 'nice-to-have' | 'reconsider';
  
  if (impact === 'high' && (effort === 'low' || effort === 'medium')) {
    // High impact, low/medium effort → Do now!
    quadrant = 'quick-win';
  } else if (impact === 'high' && effort === 'high') {
    // High impact, high effort → Worth the investment
    quadrant = 'strategic-bet';
  } else if ((impact === 'medium' || impact === 'low') && effort === 'low') {
    // Medium/low impact, low effort → Fill-in work
    quadrant = 'nice-to-have';
  } else {
    // Medium/low impact, medium/high effort → Low ROI
    quadrant = 'reconsider';
  }
  
  return { score, quadrant };
}

// Comment queries
export async function getInitiativeComments(initiativeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(comments)
    .where(eq(comments.initiativeId, initiativeId))
    .orderBy(comments.createdAt);
}

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(comments).values(data);
  return result[0].insertId;
}

export async function deleteComment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Only allow user to delete their own comments
  await db.delete(comments)
    .where(and(
      eq(comments.id, id),
      eq(comments.userId, userId)
    ));
}
