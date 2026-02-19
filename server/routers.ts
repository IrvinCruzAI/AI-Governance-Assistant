import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcrypt";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { analyzeMissionAlignment, classifyRisk, generateRAID } from "./aiService";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    signup: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password, name } = input;
        
        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
          throw new TRPCError({ code: 'CONFLICT', message: 'User with this email already exists' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create user
        const openId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.createUser({
          openId,
          email,
          passwordHash,
          name,
          loginMethod: 'email',
          role: 'user',
          lastSignedIn: new Date(),
        });
        
        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
        }
        
        // Create session token with all required fields
        const token = await sdk.signSession(
          { 
            openId: user.openId ?? '',
            appId: ENV.appId,
            name: user.name ?? ''
          },
          { expiresInMs: 30 * 24 * 60 * 60 * 1000 } // 30 days
        );
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;
        
        // Get user
        const user = await db.getUserByEmail(email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }
        
        // Update last signed in
        await db.upsertUser({
          openId: user.openId,
          lastSignedIn: new Date(),
        });
        
        // Create session token with all required fields
        const token = await sdk.signSession(
          { 
            openId: user.openId ?? '',
            appId: ENV.appId,
            name: user.name ?? ''
          },
          { expiresInMs: 30 * 24 * 60 * 60 * 1000 } // 30 days
        );
        
        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
  }),

  user: router({
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { name, email } = input;
        
        // Check if email is already taken by another user
        const existingUser = await db.getUserByEmail(email);
        if (existingUser && existingUser.id !== ctx.user.id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use by another account' });
        }
        
        // Update user
        await db.upsertUser({
          openId: ctx.user.openId,
          name,
          email,
        });
        
        return { success: true };
      }),

    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        const { currentPassword, newPassword } = input;
        
        // Get user with password hash
        const user = await db.getUserByEmail(ctx.user.email || '');
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid authentication method' });
        }
        
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // Update password
        if (!user.openId) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User openId not found' });
        }
        await db.updateUserPassword(user.openId, newPasswordHash);
        
        return { success: true };
      }),
  }),

  initiative: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const initiative = await db.getInitiativeById(input.id);
        if (!initiative) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Initiative not found' });
        }
        return initiative;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        submitterEmail: z.string().email(),
        submitterRole: z.string(),
        area: z.string(),
        problemStatement: z.string(),
        proposedSolution: z.string().optional(),
        // Step 2: Impact & Outcomes
        currentWorkflow: z.string().optional(),
        proposedWorkflow: z.string().optional(),
        bottlenecksAddressed: z.string().optional(),
        primaryMetric: z.enum(['time_savings', 'cost_reduction', 'risk_mitigation', 'revenue_increase']).optional(),
        quantifiedGoal: z.string().optional(),
        effortScore: z.number().optional(),
        returnScore: z.number().optional(),
        riskScore: z.number().optional(),
        // Step 3: Strategic Alignment
        affectedEmployeeCount: z.number().optional(),
        projectedImprovement: z.number().optional(),
        totalRevenueImpact: z.number().optional(),
        memberExperienceImpact: z.enum(['low', 'medium', 'high']).optional(),
        brandDifferentiation: z.enum(['low', 'medium', 'high']).optional(),
        operationalExcellence: z.enum(['low', 'medium', 'high']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log('[DEBUG] initiative.create called with:', { userId: ctx.user.id, input });
        try {
          const initiativeId = await db.createInitiative({
            userId: ctx.user.id,
            userRole: input.submitterRole,
            area: input.area,
            userEmail: input.submitterEmail,
            title: input.title,
            problemStatement: input.problemStatement,
            aiApproach: input.proposedSolution || null,
            // Step 2: Impact & Outcomes
            currentWorkflow: input.currentWorkflow || null,
            proposedWorkflow: input.proposedWorkflow || null,
            bottlenecksAddressed: input.bottlenecksAddressed || null,
            primaryMetric: input.primaryMetric || null,
            quantifiedGoal: input.quantifiedGoal || null,
            effortScore: input.effortScore || null,
            returnScore: input.returnScore || null,
            riskScore: input.riskScore || null,
            // Step 3: Strategic Alignment
            affectedEmployeeCount: input.affectedEmployeeCount || null,
            projectedImprovement: input.projectedImprovement || null,
            totalRevenueImpact: input.totalRevenueImpact || null,
            memberExperienceImpact: input.memberExperienceImpact || null,
            brandDifferentiation: input.brandDifferentiation || null,
            operationalExcellence: input.operationalExcellence || null,
          });
          console.log('[DEBUG] Initiative created successfully:', initiativeId);
          
          // Fetch and return the created initiative
          const initiative = await db.getInitiativeById(initiativeId);
          return initiative;
        } catch (error) {
          console.error('[ERROR] Failed to create initiative:', error);
          throw error;
        }
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          userRole: z.string().optional(),
          area: z.string().optional(),
          problemStatement: z.string().optional(),
          aiApproach: z.string().optional(),
          primaryUsers: z.string().optional(),
          missionSupports: z.string().optional(),
          wholPersonCareAlignment: z.string().optional(),
          ethicalConcerns: z.string().optional(),
          mainArea: z.string().optional(),
          clinicalImpact: z.string().optional(),
          dataType: z.string().optional(),
          automationLevel: z.string().optional(),
          missionAlignmentRating: z.enum(['High', 'Medium', 'Low']).optional(),
          missionAlignmentReasoning: z.string().optional(),
          riskLevel: z.enum(['High', 'Medium', 'Low']).optional(),
          governancePath: z.enum(['Light', 'Standard', 'Full']).optional(),
          riskReasoning: z.string().optional(),
          risks: z.string().optional(),
          assumptions: z.string().optional(),
          issues: z.string().optional(),
          dependencies: z.string().optional(),
          completed: z.boolean().optional(),
          currentStep: z.number().optional(),
          status: z.enum(['pending', 'under-review', 'approved', 'rejected']).optional(),
          roadmapStatus: z.enum(['under-review', 'research', 'development', 'pilot', 'deployed', 'on-hold', 'rejected']).optional(),
          adminNotes: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateInitiative(input.id, input.data);
        return { success: true };
      }),

    updateRoadmapStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        roadmapStatus: z.enum(['under-review', 'research', 'development', 'pilot', 'deployed', 'on-hold', 'rejected']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateInitiative(input.id, { roadmapStatus: input.roadmapStatus });
        return { success: true };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getInitiativeById(input.id);
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserInitiativesWithVotes(ctx.user.id);
      }),

    listAll: publicProcedure
      .query(async () => {
        return await db.getAllInitiatives();
      }),

    listAllWithVotes: publicProcedure
      .query(async ({ ctx }) => {
        const allInitiatives = await db.getAllInitiativesWithVotes();
        
        // If user is authenticated, check if they've voted on each initiative
        if (ctx.user) {
          const initiativesWithUserVotes = await Promise.all(
            allInitiatives.map(async (initiative) => {
              const hasVoted = await db.hasUserVoted(initiative.id, ctx.user!.id);
              return { ...initiative, hasVoted };
            })
          );
          return initiativesWithUserVotes;
        }
        
        // If not authenticated, hasVoted is false for all
        return allInitiatives.map(initiative => ({ ...initiative, hasVoted: false }));
      }),

    vote: protectedProcedure
      .input(z.object({ initiativeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.addVote({
            initiativeId: input.initiativeId,
            userId: ctx.user.id,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: error instanceof Error ? error.message : 'Failed to vote' 
          });
        }
      }),

    unvote: protectedProcedure
      .input(z.object({ initiativeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeVote(input.initiativeId, ctx.user.id);
        return { success: true };
      }),

    getVoteStatus: protectedProcedure
      .input(z.object({ initiativeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const hasVoted = await db.hasUserVoted(input.initiativeId, ctx.user.id);
        const voteCount = await db.getVoteCount(input.initiativeId);
        return { hasVoted, voteCount };
      }),

    analyzeMission: protectedProcedure
      .input(z.object({
        title: z.string(),
        problemStatement: z.string(),
        aiApproach: z.string(),
        primaryUsers: z.string(),
        missionSupports: z.array(z.string()),
        wholePersonCareAlignment: z.string(),
        ethicalConcerns: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await analyzeMissionAlignment(input);
      }),

    classifyRisk: protectedProcedure
      .input(z.object({
        title: z.string(),
        problemStatement: z.string(),
        aiApproach: z.string(),
        mainArea: z.string(),
        clinicalImpact: z.string(),
        dataType: z.string(),
        automationLevel: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await classifyRisk(input);
      }),

    generateRAID: protectedProcedure
      .input(z.object({
        title: z.string(),
        problemStatement: z.string(),
        aiApproach: z.string(),
        primaryUsers: z.string(),
        mainArea: z.string(),
        dataType: z.string(),
        ethicalConcerns: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await generateRAID(input);
      }),
  }),

  admin: router({
    // Get all initiatives (admin only)
    getAllInitiatives: adminProcedure
      .input(z.object({
        status: z.enum(['all', 'pending', 'under-review', 'approved', 'rejected']).optional(),
        riskLevel: z.enum(['all', 'Low', 'Medium', 'High']).optional(),
        area: z.string().optional(),
      }))
      .query(async () => {
        return await db.getAllInitiatives();
      }),

    // Get analytics data
    getAnalytics: adminProcedure
      .query(async () => {
        return await db.getAnalytics();
      }),

    // Update initiative status (admin only)
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected']),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateInitiativeStatus(input.id, input.status, input.adminNotes);
        return { success: true };
      }),

    // Delete initiative (admin only)
    deleteInitiative: adminProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteInitiative(input.id);
        return { success: true };
      }),

    // Update roadmap status (admin only)
    updateRoadmapStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        roadmapStatus: z.enum(['under-review', 'research', 'development', 'pilot', 'deployed', 'on-hold', 'rejected']),
      }))
      .mutation(async ({ input }) => {
        await db.updateRoadmapStatus(input.id, input.roadmapStatus);
        return { success: true };
      }),

    // Get initiatives by roadmap status
    getByRoadmapStatus: publicProcedure
      .input(z.object({
        roadmapStatus: z.enum(['under-review', 'research', 'development', 'pilot', 'deployed', 'on-hold', 'rejected']),
      }))
      .query(async ({ input }) => {
        return await db.getInitiativesByRoadmapStatus(input.roadmapStatus);
      }),

    // Update priority evaluation (admin only) - Simplified 3-field system
    updatePriorityEvaluation: adminProcedure
      .input(z.object({
        id: z.number(),
        impact: z.enum(['high', 'medium', 'low']),
        effort: z.enum(['high', 'medium', 'low']),
        evaluationNotes: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...evaluation } = input;
        // Add audit trail: who evaluated and when
        await db.updatePriorityEvaluation(id, {
          ...evaluation,
          evaluatedBy: ctx.user.name || ctx.user.email || 'Admin',
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
