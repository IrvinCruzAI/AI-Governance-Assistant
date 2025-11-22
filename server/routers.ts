import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as aiService from "./aiService";

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
    // Create a new initiative
    create: protectedProcedure
      .input(z.object({
        userRole: z.string().optional(),
        area: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const initiativeId = await db.createInitiative({
          userId: ctx.user.id,
          title: "Untitled Initiative",
          userRole: input.userRole,
          area: input.area,
          currentStep: 1,
        });
        return { initiativeId };
      }),

    // Get initiative by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getInitiativeById(input.id);
      }),

    // List user's initiatives
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserInitiatives(ctx.user.id);
      }),

    // Update initiative data
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
          missionAlignmentRating: z.enum(["High", "Medium", "Low"]).optional(),
          missionAlignmentReasoning: z.string().optional(),
          mainArea: z.string().optional(),
          clinicalImpact: z.string().optional(),
          dataType: z.string().optional(),
          automationLevel: z.string().optional(),
          riskLevel: z.enum(["Low", "Medium", "High"]).optional(),
          governancePath: z.enum(["Light", "Standard", "Full"]).optional(),
          riskReasoning: z.string().optional(),
          risks: z.string().optional(),
          assumptions: z.string().optional(),
          issues: z.string().optional(),
          dependencies: z.string().optional(),
          currentStep: z.number().optional(),
          completed: z.boolean().optional(),
          briefGenerated: z.boolean().optional(),
          emailSummaryGenerated: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateInitiative(input.id, input.data);
        return { success: true };
      }),

    // Get messages for an initiative
    getMessages: protectedProcedure
      .input(z.object({ initiativeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInitiativeMessages(input.initiativeId);
      }),

    // Add a message to an initiative
    addMessage: protectedProcedure
      .input(z.object({
        initiativeId: z.number(),
        role: z.enum(["assistant", "user"]),
        content: z.string(),
        step: z.number(),
      }))
      .mutation(async ({ input }) => {
        const messageId = await db.addMessage(input);
        return { messageId };
      }),

    // AI-powered analysis
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
        return await aiService.analyzeMissionAlignment(input);
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
        return await aiService.classifyRisk(input);
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
        return await aiService.generateRAID(input);
      }),

    getNextQuestion: protectedProcedure
      .input(z.object({
        currentStep: z.number(),
        conversationHistory: z.array(z.object({
          role: z.enum(["assistant", "user"]),
          content: z.string(),
        })),
        initiativeData: z.any(),
      }))
      .mutation(async ({ input }) => {
        return await aiService.generateNextQuestion(
          input.currentStep,
          input.conversationHistory,
          input.initiativeData
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
