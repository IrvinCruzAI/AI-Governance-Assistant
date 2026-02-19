import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createNonAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("initiative.updateRoadmapStatus", () => {
  let testInitiativeId: number;

  beforeEach(async () => {
    // Create a test initiative
    testInitiativeId = await db.createInitiative({
      userId: 1,
      userRole: "Marketing Manager",
      area: "Marketing",
      userEmail: "test@example.com",
      title: "Test Initiative for Roadmap Status",
      problemStatement: "Test problem statement",
      aiApproach: "Test AI approach",
      currentWorkflow: null,
      proposedWorkflow: null,
      bottlenecksAddressed: null,
      primaryMetric: null,
      quantifiedGoal: null,
      effortScore: 5,
      returnScore: 7,
      riskScore: 3,
      affectedEmployeeCount: null,
      projectedImprovement: null,
      totalRevenueImpact: null,
      memberExperienceImpact: null,
      brandDifferentiation: null,
      operationalExcellence: null,
    });
  });

  it("allows admin to update roadmap status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.initiative.updateRoadmapStatus({
      id: testInitiativeId,
      roadmapStatus: "development",
    });

    expect(result).toEqual({ success: true });

    // Verify the status was updated
    const initiative = await db.getInitiativeById(testInitiativeId);
    expect(initiative?.roadmapStatus).toBe("development");
  });

  it("allows admin to move initiative through different stages", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Move to research
    await caller.initiative.updateRoadmapStatus({
      id: testInitiativeId,
      roadmapStatus: "research",
    });
    let initiative = await db.getInitiativeById(testInitiativeId);
    expect(initiative?.roadmapStatus).toBe("research");

    // Move to pilot
    await caller.initiative.updateRoadmapStatus({
      id: testInitiativeId,
      roadmapStatus: "pilot",
    });
    initiative = await db.getInitiativeById(testInitiativeId);
    expect(initiative?.roadmapStatus).toBe("pilot");

    // Move to deployed
    await caller.initiative.updateRoadmapStatus({
      id: testInitiativeId,
      roadmapStatus: "deployed",
    });
    initiative = await db.getInitiativeById(testInitiativeId);
    expect(initiative?.roadmapStatus).toBe("deployed");
  });

  it("prevents non-admin from updating roadmap status", async () => {
    const ctx = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.initiative.updateRoadmapStatus({
        id: testInitiativeId,
        roadmapStatus: "development",
      })
    ).rejects.toThrow("Admin access required");
  });

  it("accepts all valid roadmap status values", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const validStatuses = [
      "under-review",
      "research",
      "development",
      "pilot",
      "deployed",
      "on-hold",
      "rejected",
    ] as const;

    for (const status of validStatuses) {
      const result = await caller.initiative.updateRoadmapStatus({
        id: testInitiativeId,
        roadmapStatus: status,
      });

      expect(result).toEqual({ success: true });

      const initiative = await db.getInitiativeById(testInitiativeId);
      expect(initiative?.roadmapStatus).toBe(status);
    }
  });
});
