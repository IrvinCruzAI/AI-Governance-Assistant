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
      userRole: "Clinical Director",
      area: "clinical-care",
    });

    expect(result).toHaveProperty("initiativeId");
    expect(typeof result.initiativeId).toBe("number");
    expect(result.initiativeId).toBeGreaterThan(0);
  });
});

describe("initiative.update", () => {
  it("updates initiative data successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an initiative first
    const created = await caller.initiative.create({
      userRole: "IT Manager",
      area: "back-office",
    });

    // Update the initiative
    const result = await caller.initiative.update({
      id: created.initiativeId,
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
      userRole: "Operations Lead",
      area: "clinical-operations",
    });

    // Update it with data
    await caller.initiative.update({
      id: created.initiativeId,
      data: {
        title: "Patient Flow Optimization",
        problemStatement: "Emergency department wait times are too long",
      },
    });

    // Retrieve it
    const initiative = await caller.initiative.get({
      id: created.initiativeId,
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
      userRole: "Clinical Director",
      area: "clinical-care",
    });

    await caller.initiative.create({
      userRole: "Clinical Director",
      area: "clinical-support",
    });

    // List initiatives
    const initiatives = await caller.initiative.list();

    expect(Array.isArray(initiatives)).toBe(true);
    expect(initiatives.length).toBeGreaterThanOrEqual(2);
  });
});

describe("initiative.addMessage", () => {
  it("adds a message to an initiative", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an initiative
    const created = await caller.initiative.create({
      userRole: "Test User",
      area: "back-office",
    });

    // Add a message
    const result = await caller.initiative.addMessage({
      initiativeId: created.initiativeId,
      role: "assistant",
      content: "Welcome to the AI Initiative Intake Assistant!",
      step: 1,
    });

    expect(result).toHaveProperty("messageId");
    expect(typeof result.messageId).toBe("number");
  });
});

describe("initiative.getMessages", () => {
  it("retrieves messages for an initiative", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an initiative
    const created = await caller.initiative.create({
      userRole: "Test User",
      area: "clinical-care",
    });

    // Add messages
    await caller.initiative.addMessage({
      initiativeId: created.initiativeId,
      role: "assistant",
      content: "What is your initiative title?",
      step: 1,
    });

    await caller.initiative.addMessage({
      initiativeId: created.initiativeId,
      role: "user",
      content: "AI Diagnostic Assistant",
      step: 1,
    });

    // Retrieve messages
    const messages = await caller.initiative.getMessages({
      initiativeId: created.initiativeId,
    });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(2);
    expect(messages[0]?.role).toBe("assistant");
    expect(messages[1]?.role).toBe("user");
  });
});
