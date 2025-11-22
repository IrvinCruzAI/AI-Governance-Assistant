import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
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
  }),

  initiative: router({
    create: protectedProcedure
      .input(z.object({
        userRole: z.string(),
        area: z.string(),
        userEmail: z.string(),
        department: z.string().optional(),
        urgency: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const initiativeId = await db.createInitiative({
          userId: ctx.user.id,
          userRole: input.userRole,
          area: input.area,
          userEmail: input.userEmail,
          title: "Untitled Initiative",
        });
        return { initiativeId };
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
          adminNotes: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateInitiative(input.id, input.data);
        return { success: true };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getInitiativeById(input.id);
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserInitiatives(ctx.user.id);
      }),

    listAll: publicProcedure
      .query(async () => {
        return await db.getAllInitiatives();
      }),

    listAllWithVotes: publicProcedure
      .query(async () => {
        return await db.getAllInitiativesWithVotes();
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

    addMessage: protectedProcedure
      .input(z.object({
        initiativeId: z.number(),
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        step: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const messageId = await db.addMessage({
          initiativeId: input.initiativeId,
          role: input.role,
          content: input.content,
          step: input.step,
        });
        return { messageId };
      }),

    getMessages: protectedProcedure
      .input(z.object({ initiativeId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getInitiativeMessages(input.initiativeId);
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

    // Update priority evaluation (admin only)
    updatePriorityEvaluation: adminProcedure
      .input(z.object({
        id: z.number(),
        impactScale: z.enum(['large', 'medium', 'small']).optional(),
        impactBenefitType: z.enum(['patient-safety', 'patient-outcomes', 'staff-efficiency', 'cost-reduction', 'experience']).optional(),
        impactFinancialReturn: z.enum(['high', 'some', 'minimal']).optional(),
        feasibilityComplexity: z.enum(['simple', 'moderate', 'complex']).optional(),
        feasibilityTimeline: z.enum(['quick', 'standard', 'long']).optional(),
        feasibilityDependencies: z.enum(['ready', 'minor', 'major']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...evaluation } = input;
        await db.updatePriorityEvaluation(id, evaluation);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
