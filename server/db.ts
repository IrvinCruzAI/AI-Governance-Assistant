import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, initiatives, messages, InsertInitiative, InsertMessage } from "../drizzle/schema";
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
