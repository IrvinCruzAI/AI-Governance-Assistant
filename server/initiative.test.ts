import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@adventhealth.com",
    name: "Test User",
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

  return { ctx };
}

describe("initiative.create", () => {
  it("creates a new initiative with user role and area", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.initiative.create({
      title: "Test Initiative",
      submitterEmail: "test@adventhealth.com",
      submitterRole: "Clinical Director",
      area: "clinical-care",
      problemStatement: "Test problem statement",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    expect(result.id).toBeGreaterThan(0);
  });
});

describe("initiative.update", () => {
  it("updates initiative data successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an initiative first
    const created = await caller.initiative.create({
      title: "Test Initiative",
      submitterEmail: "test@adventhealth.com",
      submitterRole: "IT Manager",
      area: "back-office",
      problemStatement: "Test problem statement",
    });

    // Update the initiative
    const result = await caller.initiative.update({
      id: created.id,
      data: {
        title: "AI-Powered Scheduling System",
        problemStatement: "Current scheduling is inefficient and time-consuming",
        aiApproach: "Use AI to optimize staff schedules based on demand patterns",
      },
    });

    expect(result).toEqual({ success: true });
  });
});

describe("initiative.get", () => {
  it("retrieves an initiative by ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an initiative
    const created = await caller.initiative.create({
      title: "Test Initiative",
      submitterEmail: "test@adventhealth.com",
      submitterRole: "Operations Lead",
      area: "clinical-operations",
      problemStatement: "Test problem statement",
    });

    // Update it with data
    await caller.initiative.update({
      id: created.id,
      data: {
        title: "Patient Flow Optimization",
        problemStatement: "Emergency department wait times are too long",
      },
    });

    // Retrieve it
    const initiative = await caller.initiative.get({
      id: created.id,
    });

    expect(initiative).toBeDefined();
    expect(initiative?.title).toBe("Patient Flow Optimization");
    expect(initiative?.problemStatement).toBe("Emergency department wait times are too long");
    expect(initiative?.userRole).toBe("Operations Lead");
  });
});

describe("initiative.list", () => {
  it("lists all initiatives for the authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create multiple initiatives
    await caller.initiative.create({
      title: "Test Initiative",
      submitterEmail: "test@adventhealth.com",
      submitterRole: "Clinical Director",
      area: "clinical-care",
      problemStatement: "Test problem statement",
    });

    await caller.initiative.create({
      title: "Test Initiative",
      submitterEmail: "test@adventhealth.com",
      submitterRole: "Clinical Director",
      area: "clinical-support",
      problemStatement: "Test problem statement",
    });

    // List initiatives
    const initiatives = await caller.initiative.list();

    expect(Array.isArray(initiatives)).toBe(true);
    expect(initiatives.length).toBeGreaterThanOrEqual(2);
  });
});


