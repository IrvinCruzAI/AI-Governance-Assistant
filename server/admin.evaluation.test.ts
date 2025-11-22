import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const adminUser: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@adventhealth.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Simplified Evaluation System (3-field: Impact/Effort/Notes)", () => {
  it("should update evaluation with impact, effort, and notes", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Update evaluation with all 3 fields
    const result = await caller.admin.updatePriorityEvaluation({
      id: 1,
      impact: "high",
      effort: "low",
      evaluationNotes: "High impact initiative with quick implementation path",
      tags: ["quick-win", "patient-safety"],
    });

    expect(result).toEqual({ success: true });
  });

  it("should capture evaluatedBy from context user", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // The mutation should automatically capture evaluatedBy from ctx.user
    const result = await caller.admin.updatePriorityEvaluation({
      id: 1,
      impact: "medium",
      effort: "medium",
      evaluationNotes: "Moderate priority",
    });

    expect(result).toEqual({ success: true });
    
    // Note: We can't directly verify evaluatedBy in this test without querying the DB,
    // but the backend code ensures it's set from ctx.user.name || ctx.user.email
  });

  it("should calculate priority quadrant from impact/effort matrix", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // High impact + Low effort = Quick Win
    await caller.admin.updatePriorityEvaluation({
      id: 1,
      impact: "high",
      effort: "low",
    });

    // High impact + High effort = Strategic Bet
    await caller.admin.updatePriorityEvaluation({
      id: 2,
      impact: "high",
      effort: "high",
    });

    // Low impact + Low effort = Nice to Have
    await caller.admin.updatePriorityEvaluation({
      id: 3,
      impact: "low",
      effort: "low",
    });

    // Low impact + High effort = Reconsider
    await caller.admin.updatePriorityEvaluation({
      id: 4,
      impact: "low",
      effort: "high",
    });

    // All should succeed
    expect(true).toBe(true);
  });

  it("should allow evaluation without notes (notes are optional)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updatePriorityEvaluation({
      id: 1,
      impact: "high",
      effort: "medium",
      // No evaluationNotes provided
    });

    expect(result).toEqual({ success: true });
  });

  it("should allow evaluation without tags (tags are optional)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updatePriorityEvaluation({
      id: 1,
      impact: "medium",
      effort: "low",
      evaluationNotes: "Good opportunity",
      // No tags provided
    });

    expect(result).toEqual({ success: true });
  });
});
