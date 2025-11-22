import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(userId: number = 100): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `admin-${userId}`,
    email: `admin${userId}@adventhealth.com`,
    name: `Admin User ${userId}`,
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createUserContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@adventhealth.com`,
    name: `Test User ${userId}`,
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Roadmap Status Management", () => {
  it("should allow admin to update roadmap status", async () => {
    const adminCtx = createAdminContext(100);
    const userCtx = createUserContext(10);
    const adminCaller = appRouter.createCaller(adminCtx);
    const userCaller = appRouter.createCaller(userCtx);

    // Create a test initiative as a regular user
    const { initiativeId } = await userCaller.initiative.create({
      userRole: "Nurse",
      area: "clinical-care",
      userEmail: "test@adventhealth.com",
    });

    // Admin updates roadmap status
    const result = await adminCaller.admin.updateRoadmapStatus({
      id: initiativeId,
      roadmapStatus: "research",
    });

    expect(result).toEqual({ success: true });
  });

  it("should prevent non-admin users from updating roadmap status", async () => {
    const userCtx = createUserContext(11);
    const userCaller = appRouter.createCaller(userCtx);

    // Create a test initiative
    const { initiativeId } = await userCaller.initiative.create({
      userRole: "Doctor",
      area: "clinical-care",
      userEmail: "test11@adventhealth.com",
    });

    // Non-admin tries to update roadmap status - should fail
    await expect(
      userCaller.admin.updateRoadmapStatus({
        id: initiativeId,
        roadmapStatus: "development",
      })
    ).rejects.toThrow("Admin access required");
  });

  it("should retrieve initiatives by roadmap status", async () => {
    const adminCtx = createAdminContext(101);
    const userCtx = createUserContext(12);
    const adminCaller = appRouter.createCaller(adminCtx);
    const userCaller = appRouter.createCaller(userCtx);

    // Create a test initiative
    const { initiativeId } = await userCaller.initiative.create({
      userRole: "Pharmacist",
      area: "clinical-support",
      userEmail: "test12@adventhealth.com",
    });

    // Update to pilot status
    await adminCaller.admin.updateRoadmapStatus({
      id: initiativeId,
      roadmapStatus: "pilot",
    });

    // Retrieve initiatives in pilot status
    const pilotInitiatives = await userCaller.admin.getByRoadmapStatus({
      roadmapStatus: "pilot",
    });

    // Verify the initiative is in the results
    const foundInitiative = pilotInitiatives.find((i: any) => i.id === initiativeId);
    expect(foundInitiative).toBeDefined();
    expect((foundInitiative as any)?.roadmapStatus).toBe("pilot");
  });

  it("should support all roadmap status transitions", async () => {
    const adminCtx = createAdminContext(102);
    const userCtx = createUserContext(13);
    const adminCaller = appRouter.createCaller(adminCtx);
    const userCaller = appRouter.createCaller(userCtx);

    // Create a test initiative
    const { initiativeId } = await userCaller.initiative.create({
      userRole: "Administrator",
      area: "back-office",
      userEmail: "test13@adventhealth.com",
    });

    const statuses = [
      "under-review",
      "research",
      "development",
      "pilot",
      "deployed",
      "on-hold",
      "rejected",
    ] as const;

    // Test each status transition
    for (const status of statuses) {
      const result = await adminCaller.admin.updateRoadmapStatus({
        id: initiativeId,
        roadmapStatus: status,
      });

      expect(result).toEqual({ success: true });
    }
  });

  it("should default new initiatives to under-review roadmap status", async () => {
    const userCtx = createUserContext(14);
    const userCaller = appRouter.createCaller(userCtx);

    // Create a test initiative
    const { initiativeId } = await userCaller.initiative.create({
      userRole: "Technician",
      area: "clinical-operations",
      userEmail: "test14@adventhealth.com",
    });

    // Retrieve the initiative
    const initiative = await userCaller.initiative.get({ id: initiativeId });

    // Verify default roadmap status
    expect((initiative as any)?.roadmapStatus).toBe("under-review");
  });
});
