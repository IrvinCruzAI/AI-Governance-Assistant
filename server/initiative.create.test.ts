import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("initiative.create", () => {
  it("creates a new initiative with all required fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.initiative.create({
      title: "Test Initiative",
      submitterEmail: "test@adventhealth.com",
      submitterRole: "Clinical Director",
      area: "clinical-care",
      problemStatement: "This is a test problem statement describing the issue.",
      proposedSolution: "This is a proposed AI solution to address the problem.",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.title).toBe("Test Initiative");
    expect(result.userEmail).toBe("test@adventhealth.com");
    expect(result.userRole).toBe("Clinical Director");
    expect(result.area).toBe("clinical-care");
    expect(result.problemStatement).toBe("This is a test problem statement describing the issue.");
    expect(result.aiApproach).toBe("This is a proposed AI solution to address the problem.");
    expect(result.status).toBe("pending");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("creates initiative without optional proposedSolution field", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.initiative.create({
      title: "Minimal Initiative",
      submitterEmail: "minimal@adventhealth.com",
      submitterRole: "Nurse",
      area: "clinical-operations",
      problemStatement: "A problem without a solution yet.",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.title).toBe("Minimal Initiative");
    expect(result.aiApproach).toBeNull();
  });

  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.initiative.create({
        title: "Unauthorized Initiative",
        submitterEmail: "test@adventhealth.com",
        submitterRole: "Doctor",
        area: "clinical-care",
        problemStatement: "This should fail.",
      })
    ).rejects.toThrow();
  });
});
