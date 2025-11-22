import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * AI initiatives submitted through the intake process
 */
export const initiatives = mysqlTable("initiatives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Step 1: Role & Area
  userRole: text("userRole"),
  userEmail: varchar("userEmail", { length: 320 }),
  area: varchar("area", { length: 100 }),
  
  // Step 2: Initiative Basics
  title: varchar("title", { length: 255 }).notNull(),
  problemStatement: text("problemStatement"),
  aiApproach: text("aiApproach"),
  primaryUsers: text("primaryUsers"),
  
  // Step 3: Mission & Ethics
  missionSupports: text("missionSupports"), // JSON array
  wholPersonCareAlignment: text("wholPersonCareAlignment"),
  ethicalConcerns: text("ethicalConcerns"),
  missionAlignmentRating: mysqlEnum("missionAlignmentRating", ["High", "Medium", "Low"]),
  missionAlignmentReasoning: text("missionAlignmentReasoning"),
  
  // Step 4: Risk Classification
  mainArea: varchar("mainArea", { length: 100 }),
  clinicalImpact: varchar("clinicalImpact", { length: 100 }),
  dataType: varchar("dataType", { length: 100 }),
  automationLevel: varchar("automationLevel", { length: 100 }),
  riskLevel: mysqlEnum("riskLevel", ["Low", "Medium", "High"]),
  governancePath: mysqlEnum("governancePath", ["Light", "Standard", "Full"]),
  riskReasoning: text("riskReasoning"),
  
  // Step 5: RAID
  risks: text("risks"), // JSON array
  assumptions: text("assumptions"), // JSON array
  issues: text("issues"), // JSON array
  dependencies: text("dependencies"), // JSON array
  
  // Step 6: Generated outputs
  briefGenerated: boolean("briefGenerated").default(false),
  emailSummaryGenerated: boolean("emailSummaryGenerated").default(false),
  
  // Simplified Evaluation (Admin evaluates)
  impact: mysqlEnum("impact", ["high", "medium", "low"]), // Value/benefit to organization
  effort: mysqlEnum("effort", ["high", "medium", "low"]), // Complexity/resources required
  evaluationNotes: text("evaluationNotes"), // Admin's assessment notes
  evaluatedBy: varchar("evaluatedBy", { length: 255 }), // Admin who evaluated
  evaluatedAt: timestamp("evaluatedAt"), // When evaluation was completed
  
  // Calculated Priority (Impact vs Effort matrix)
  priorityScore: int("priorityScore"), // Calculated from impact + effort
  priorityQuadrant: mysqlEnum("priorityQuadrant", ["quick-win", "strategic-bet", "nice-to-have", "reconsider"]),
  
  // Keyword Tags (for search and duplicate detection)
  tags: text("tags"), // JSON array of keywords
  
  // Admin fields
  status: mysqlEnum("status", ["pending", "under-review", "approved", "rejected"]).default("pending"),
  roadmapStatus: mysqlEnum("roadmapStatus", ["under-review", "research", "development", "pilot", "deployed", "on-hold", "rejected"]).default("under-review"),
  adminNotes: text("adminNotes"),
  
  // Metadata
  currentStep: int("currentStep").default(1),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Initiative = typeof initiatives.$inferSelect;
export type InsertInitiative = typeof initiatives.$inferInsert;

/**
 * Conversation messages for each initiative
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  initiativeId: int("initiativeId").notNull(),
  role: mysqlEnum("role", ["assistant", "user"]).notNull(),
  content: text("content").notNull(),
  step: int("step").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Votes on initiatives - tracks which users voted for which initiatives
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  initiativeId: int("initiativeId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
