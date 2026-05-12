import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, studyRoadmaps, users } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";
import { requireVerifiedEmail } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/ratelimit";
import { callDify, extractJSON } from "@/lib/dify";
import { buildRoadmapPrompt } from "@/lib/prompts/roadmap";

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

    // 2. Rate Limiting
    const rateLimit = await checkRateLimit(userId, "ROADMAP");
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

    // 3. Auth & Authorization check
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
      remaining: rateLimit.remaining
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
        examLanguage: (user.examLanguage as "ru" | "kz" | "en") || "ru",
      };

      const prompt = buildRoadmapPrompt(promptParams);

      const difyResponse = await callDify(
        prompt,
        {}, // Empty inputs as prompt is now in query
        userId
      );

      const roadmapData = extractJSON(difyResponse.answer);
      
      if (roadmapData.error) {
        return NextResponse.json({ 
          error: "Unprocessable Entity", 
          message: roadmapData.message 
        }, { status: 422 });
      }

      const roadmap = await db.insert(studyRoadmaps).values({
        userId: user.id,
        currentScore: session.score,
        targetScore: user.targetScore,
        daysUntilExam: 30,
        roadmapData: roadmapData,
        modelVersion: "dify-prompt-v1",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).returning();

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
