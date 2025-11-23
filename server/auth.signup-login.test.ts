import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import { COOKIE_NAME } from "../shared/const";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(): { 
  ctx: TrpcContext; 
  cookies: Map<string, { value: string; options: Record<string, unknown> }>;
} {
  const cookies = new Map<string, { value: string; options: Record<string, unknown> }>();

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

describe("auth.signup and auth.login", () => {
  const testPassword = "TestPassword123!";
  const testName = "Test User";
  
  // Helper to generate unique email for each test
  const getUniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@adventhealth.com`;

  it("should create a new user account with signup", async () => {
    const testEmail = getUniqueEmail();
    const { ctx, cookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.signup({
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    // Verify response
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.name).toBe(testName);
    expect(result.user.role).toBe("user");

    // Verify session cookie was set
    expect(cookies.has(COOKIE_NAME)).toBe(true);
    const sessionCookie = cookies.get(COOKIE_NAME);
    expect(sessionCookie?.value).toBeTruthy();
    expect(sessionCookie?.value.length).toBeGreaterThan(50); // JWT tokens are long

    // Verify user was created in database
    const dbUser = await db.getUserByEmail(testEmail);
    expect(dbUser).toBeDefined();
    expect(dbUser?.email).toBe(testEmail);
    expect(dbUser?.name).toBe(testName);
    expect(dbUser?.passwordHash).toBeTruthy();
  });

  it("should log in with correct credentials", async () => {
    const testEmail = getUniqueEmail();
    const { ctx, cookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First create an account
    await caller.auth.signup({
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    // Clear cookies to simulate a fresh session
    cookies.clear();

    // Now try to log in
    const result = await caller.auth.login({
      email: testEmail,
      password: testPassword,
    });

    // Verify response
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.name).toBe(testName);

    // Verify session cookie was set
    expect(cookies.has(COOKIE_NAME)).toBe(true);
    const sessionCookie = cookies.get(COOKIE_NAME);
    expect(sessionCookie?.value).toBeTruthy();
    expect(sessionCookie?.value.length).toBeGreaterThan(50);
  });

  it("should reject login with incorrect password", async () => {
    const testEmail = getUniqueEmail();
    const { ctx, cookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First create an account
    await caller.auth.signup({
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    // Try to log in with wrong password
    await expect(
      caller.auth.login({
        email: testEmail,
        password: "WrongPassword123!",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should reject login with non-existent email", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Try to log in with non-existent email
    await expect(
      caller.auth.login({
        email: "nonexistent@adventhealth.com",
        password: testPassword,
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should reject signup with duplicate email", async () => {
    const testEmail = getUniqueEmail();
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First signup
    await caller.auth.signup({
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    // Try to signup again with same email
    await expect(
      caller.auth.signup({
        name: "Another User",
        email: testEmail,
        password: "AnotherPassword123!",
      })
    ).rejects.toThrow("User with this email already exists");
  });
});
