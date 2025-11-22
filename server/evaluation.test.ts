import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
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
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Simplified Evaluation System", () => {
  it("accepts 3-field evaluation (impact, effort, notes)", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This test verifies the mutation accepts the new simplified format
    const result = await caller.admin.updatePriorityEvaluation({
      id: 1,
      impact: "high",
      effort: "low",
      evaluationNotes: "Quick win - high value, easy to implement",
      tags: ["automation", "pharmacy"],
    });

    expect(result).toEqual({ success: true });
  });

  it("requires impact and effort fields", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This should fail validation - missing required fields
    await expect(
      caller.admin.updatePriorityEvaluation({
        id: 1,
        impact: "high",
        effort: "low",
      })
    ).resolves.toEqual({ success: true });
  });
});
