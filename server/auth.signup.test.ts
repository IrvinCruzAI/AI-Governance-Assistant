import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): { ctx: TrpcContext; cookies: Map<string, any> } {
  const cookies = new Map<string, any>();

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        cookies.set(name, { value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cookies.delete(name);
      },
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

describe("auth.signup", () => {
  it("creates a new user account with email and password", async () => {
    const { ctx, cookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.signup({
      name: "Test User",
      email: `test-${Date.now()}@adventhealth.com`,
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.name).toBe("Test User");
    expect(result.user.email).toContain("@adventhealth.com");
    expect(result.user.role).toBe("user");
    
    // Check that session cookie was set
    expect(cookies.has(COOKIE_NAME)).toBe(true);
  });

  it("prevents duplicate email registration", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const email = `duplicate-${Date.now()}@adventhealth.com`;
    
    // Create first account
    await caller.auth.signup({
      name: "First User",
      email,
      password: "password123",
    });

    // Try to create duplicate
    await expect(
      caller.auth.signup({
        name: "Second User",
        email,
        password: "different456",
      })
    ).rejects.toThrow("User with this email already exists");
  });

  it("requires minimum password length", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.signup({
        name: "Test User",
        email: `test-${Date.now()}@adventhealth.com`,
        password: "short",
      })
    ).rejects.toThrow();
  });
});
