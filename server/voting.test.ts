import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@adventhealth.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
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

describe("Voting System", () => {
  it("should allow authenticated users to vote for an initiative", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Create a test initiative first
    const { initiativeId } = await caller.initiative.create({
      userRole: "Nurse",
      area: "clinical-care",
      userEmail: "test@adventhealth.com",
    });

    // Vote for the initiative
    const result = await caller.initiative.vote({ initiativeId });

    expect(result).toEqual({ success: true });
  });

  it("should prevent duplicate votes from the same user", async () => {
    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    // Create a test initiative
    const { initiativeId } = await caller.initiative.create({
      userRole: "Doctor",
      area: "clinical-care",
      userEmail: "test2@adventhealth.com",
    });

    // First vote should succeed
    await caller.initiative.vote({ initiativeId });

    // Second vote should fail
    await expect(
      caller.initiative.vote({ initiativeId })
    ).rejects.toThrow("User already voted for this initiative");
  });

  it("should allow users to remove their vote", async () => {
    const ctx = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);

    // Create a test initiative
    const { initiativeId } = await caller.initiative.create({
      userRole: "Pharmacist",
      area: "clinical-support",
      userEmail: "test3@adventhealth.com",
    });

    // Vote for the initiative
    await caller.initiative.vote({ initiativeId });

    // Remove the vote
    const result = await caller.initiative.unvote({ initiativeId });

    expect(result).toEqual({ success: true });
  });

  it("should track vote counts correctly", async () => {
    const ctx1 = createAuthContext(4);
    const ctx2 = createAuthContext(5);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // Create a test initiative
    const { initiativeId } = await caller1.initiative.create({
      userRole: "Administrator",
      area: "back-office",
      userEmail: "test4@adventhealth.com",
    });

    // Two users vote
    await caller1.initiative.vote({ initiativeId });
    await caller2.initiative.vote({ initiativeId });

    // Check vote status for user 1
    const voteStatus = await caller1.initiative.getVoteStatus({ initiativeId });

    expect(voteStatus.hasVoted).toBe(true);
    expect(voteStatus.voteCount).toBe(2);
  });

  it("should return initiatives sorted by vote count", async () => {
    const ctx = createAuthContext(6);
    const caller = appRouter.createCaller(ctx);

    // Get initiatives with votes
    const initiatives = await caller.initiative.listAllWithVotes();

    // Verify it returns an array
    expect(Array.isArray(initiatives)).toBe(true);

    // If there are multiple initiatives, verify they're sorted by vote count
    if (initiatives.length > 1) {
      for (let i = 0; i < initiatives.length - 1; i++) {
        const currentVotes = (initiatives[i] as any).voteCount || 0;
        const nextVotes = (initiatives[i + 1] as any).voteCount || 0;
        expect(currentVotes).toBeGreaterThanOrEqual(nextVotes);
      }
    }
  });
});
