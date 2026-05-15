import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, studyRoadmaps, users } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";
import { requireVerifiedEmail } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/ratelimit";
import { callDify, extractJSON } from "@/lib/dify";
import { buildRoadmapPrompt } from "@/lib/prompts/roadmap";
import { z } from "zod";

const LocalizedStringSchema = z.object({
  kz: z.string().min(1),
  ru: z.string().min(1),
  en: z.string().min(1),
});

const RoadmapResponseSchema = z.object({
  summary: z.object({
    feasibility: z.enum(["easy", "medium", "hard", "very_hard"]),
    estimatedScoreGain: z.number(),
    recommendedHoursPerDay: z.number(),
  }),
  weeklyPlan: z.array(z.object({
    weekIndex: z.number(),
    focus: LocalizedStringSchema,
    topics: z.array(z.object({
      id: z.number(),
      title: LocalizedStringSchema,
      objective: LocalizedStringSchema,
    })),
  })),
  priorityTopics: z.array(z.object({
    topicId: z.number(),
    estimatedHours: z.number(),
    impactOnScore: z.number(),
    reason: LocalizedStringSchema,
  })),
  motivationalMessage: LocalizedStringSchema,
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await requireVerifiedEmail(userId);
    if (!verification.ok) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED", message: "Please verify your email to use this feature" },
        { status: 403 }
      );
    }

    const { sessionId } = await req.json();

    // 1. Validation
    if (!sessionId || !UUID_REGEX.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
    }

    // 2. Auth & Authorization check (Pre-check for role)
    const [session, user] = await Promise.all([
      db.query.testSessions.findFirst({ 
        where: and(eq(testSessions.id, sessionId), eq(testSessions.userId, userId)) 
      }),
      db.query.users.findFirst({ 
        where: eq(users.id, userId),
        with: {
          targetSpecialty: true,
          targetCombination: { with: { subject1: true, subject2: true } }
        }
      })
    ]);

    if (!session) return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
    if (!user) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    const isAdmin = user.isAdmin;
    console.log(`[Roadmap] user: ${userId}, isAdmin: ${isAdmin}`);

    // 3. Rate Limiting
    let rateLimit: { allowed: boolean; remaining: number; resetAt?: Date } | null = null;

    if (!isAdmin) {
      rateLimit = await checkRateLimit(userId, "ROADMAP");
      console.log(`[Roadmap] rate limit bypass: NO, remaining: ${rateLimit.remaining}`);
      if (!rateLimit.allowed) {
        return NextResponse.json({
          error: "Rate limit exceeded",
          message: "You can generate maximum 3 roadmaps per day",
          resetAt: rateLimit.resetAt,
        }, { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt!.getTime() - Date.now()) / 1000).toString()
          }
        });
      }
    } else {
      console.log("[Roadmap] rate limit bypass: YES");
    }


    // 4. Cache Check
    const existingRoadmap = await db.query.studyRoadmaps.findFirst({
      where: and(
        eq(studyRoadmaps.userId, userId),
        gte(studyRoadmaps.expiresAt, new Date())
      ),
      orderBy: desc(studyRoadmaps.generatedAt)
    });

    if (existingRoadmap) {
      console.log("[AI Roadmap] Returning cached roadmap", {
        userId: userId.substring(0, 8) + "...",
        sessionId: sessionId.substring(0, 8) + "..."
      });
      return NextResponse.json({
        ...existingRoadmap,
        cached: true
      });
    }

    console.log("[AI Roadmap] Requesting Dify for new roadmap", {
      userId: userId.substring(0, 8) + "...",
      sessionId: sessionId.substring(0, 8) + "...",
      remaining: isAdmin ? "unlimited" : (rateLimit?.remaining ?? "n/a")
    });


    // 5. AI Generation via Dify
    const results = typeof session.results === 'string' ? JSON.parse(session.results) : (session.results || {});
    const breakdown = results.subjectBreakdown || {};
    
    // Extract weak topics (subjects where accuracy < 70%)
    const weakTopics = Object.entries(breakdown).map(([id, data]: [string, any]) => {
      const accuracy = Math.round((data.score / Math.max(data.total, 1)) * 100);
      return {
        subject: data.name || id,
        topic: "General subject performance", // We use subjects as topics since we don't have per-topic breakdown yet
        accuracy
      };
    }).filter(t => t.accuracy < 70);

    try {
      const promptParams = {
        currentScore: session.score || 0,
        targetScore: user.targetScore || 100,
        weakTopics: weakTopics,
        daysUntilExam: 30, // Default to 30 days
      };

      let finalRoadmapData: any = null;
      let lastError: any = null;
      let prompt = buildRoadmapPrompt(promptParams);
      const maxAttempts = 2;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`\n========== ROADMAP GENERATION ATTEMPT ${attempt}/${maxAttempts} ==========`);
          console.log("[1] Prompt length:", prompt.length);

          const difyResponse = await callDify(
            prompt,
            {}, // Empty inputs as prompt is now in query
            userId
          );

          const rawAnswer = difyResponse.answer;
          console.log("[2] Raw AI response (first 500 chars):");
          console.log(typeof rawAnswer === "string" ? rawAnswer.substring(0, 500) : JSON.stringify(rawAnswer).substring(0, 500));

          const roadmapData = extractJSON(rawAnswer);
          
          if (roadmapData.error) {
            throw new Error(roadmapData.message || "Failed to extract JSON");
          }

          console.log("[3] Type of weeklyPlan[0].focus:", typeof roadmapData?.weeklyPlan?.[0]?.focus);
          console.log("[4] Value of weeklyPlan[0].focus:", JSON.stringify(roadmapData?.weeklyPlan?.[0]?.focus, null, 2));

          const validated = RoadmapResponseSchema.safeParse(roadmapData);
          console.log("[5] Zod validation:", validated.success ? "PASSED ✅" : "FAILED ❌");

          if (validated.success) {
            finalRoadmapData = validated.data;
            break; 
          } else {
            console.error("[6] Zod errors:", JSON.stringify(validated.error.issues, null, 2));
            lastError = validated.error;
            
            if (attempt < maxAttempts) {
              prompt += `\n\n🚨 PREVIOUS RESPONSE WAS INVALID 🚨
Your last response had text fields as plain strings instead of multilingual objects.
You MUST return ALL text fields (focus, title, objective, reason, motivationalMessage) 
as objects with kz, ru, en keys. THIS IS MANDATORY.`;
            }
          }
        } catch (err) {
          console.error(`[Roadmap] Attempt ${attempt} error:`, err);
          lastError = err;
        }
      }

      if (!finalRoadmapData) {
        throw new Error(`Failed to generate valid multilingual roadmap after ${maxAttempts} attempts. Last error: ${lastError?.message || "Validation failed"}`);
      }

      const roadmap = await db.insert(studyRoadmaps).values({
        userId: user.id,
        currentScore: session.score,
        targetScore: user.targetScore,
        daysUntilExam: 30,
        roadmapData: finalRoadmapData,
        modelVersion: "dify-prompt-v1-multi",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).returning();

      console.log("========== ROADMAP GENERATION SUCCESS ==========\n");
      return NextResponse.json(roadmap[0]);

    } catch (difyError) {
      console.error("Dify Generation Error:", difyError);
      return NextResponse.json({ 
        error: "AI service temporarily unavailable", 
        message: "AI teacher is resting. Please try again in 5-10 minutes." 
      }, { status: 503 });
    }

  } catch (error) {
    console.error("Roadmap API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
