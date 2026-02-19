import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "email",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("comments", () => {
  describe("create", () => {
    it("creates a comment when user is authenticated", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.comments.create({
        initiativeId: 1,
        content: "This is a test comment",
      });

      expect(result.success).toBe(true);
      expect(result.commentId).toBeTypeOf("number");
    });

    it("includes user name and role in comment", async () => {
      const { ctx } = createAuthContext(1, "admin");
      const caller = appRouter.createCaller(ctx);

      await caller.comments.create({
        initiativeId: 1,
        content: "Admin comment",
      });

      const comments = await caller.comments.list({ initiativeId: 1 });
      const lastComment = comments[comments.length - 1];

      expect(lastComment?.userName).toBe("Test User 1");
      expect(lastComment?.userRole).toBe("admin");
    });

    it("rejects empty comments", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.comments.create({
          initiativeId: 1,
          content: "",
        })
      ).rejects.toThrow();
    });

    it("rejects comments over 5000 characters", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const longContent = "a".repeat(5001);

      await expect(
        caller.comments.create({
          initiativeId: 1,
          content: longContent,
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("returns comments for an initiative", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a comment first
      await caller.comments.create({
        initiativeId: 1,
        content: "Test comment for listing",
      });

      const comments = await caller.comments.list({ initiativeId: 1 });

      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);
    });

    it("returns comments in chronological order", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create multiple comments
      await caller.comments.create({
        initiativeId: 2,
        content: "First comment",
      });

      await caller.comments.create({
        initiativeId: 2,
        content: "Second comment",
      });

      const comments = await caller.comments.list({ initiativeId: 2 });

      expect(comments.length).toBeGreaterThanOrEqual(2);
      // Verify chronological order (oldest first)
      for (let i = 1; i < comments.length; i++) {
        const prev = new Date(comments[i - 1]!.createdAt).getTime();
        const curr = new Date(comments[i]!.createdAt).getTime();
        expect(curr).toBeGreaterThanOrEqual(prev);
      }
    });
  });

  describe("delete", () => {
    it("allows user to delete their own comment", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Create a comment
      const { commentId } = await caller.comments.create({
        initiativeId: 3,
        content: "Comment to be deleted",
      });

      // Delete it
      const result = await caller.comments.delete({ id: commentId });

      expect(result.success).toBe(true);

      // Verify it's deleted
      const comments = await caller.comments.list({ initiativeId: 3 });
      const deletedComment = comments.find((c) => c.id === commentId);
      expect(deletedComment).toBeUndefined();
    });

    it("prevents user from deleting another user's comment", async () => {
      const { ctx: ctx1 } = createAuthContext(1);
      const caller1 = appRouter.createCaller(ctx1);

      // User 1 creates a comment
      const { commentId } = await caller1.comments.create({
        initiativeId: 4,
        content: "User 1 comment",
      });

      // User 2 tries to delete it
      const { ctx: ctx2 } = createAuthContext(2);
      const caller2 = appRouter.createCaller(ctx2);

      await caller2.comments.delete({ id: commentId });

      // Comment should still exist
      const comments = await caller1.comments.list({ initiativeId: 4 });
      const comment = comments.find((c) => c.id === commentId);
      expect(comment).toBeDefined();
    });
  });
});
