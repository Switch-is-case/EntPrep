import { NextResponse } from "next/server";
import { db } from "@/db";
import { testSessions, studyRoadmaps, users, subjectCombinations, specialties } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    const [session, user] = await Promise.all([
      db.query.testSessions.findFirst({ where: eq(testSessions.id, sessionId) }),
      db.query.users.findFirst({ 
        where: eq(users.id, userId),
        with: {
          targetSpecialty: true,
          targetCombination: { with: { subject1: true, subject2: true } }
        }
      })
    ]);

    if (!session || !user) return NextResponse.json({ error: "Data missing" }, { status: 404 });

    const results = JSON.parse(session.results as string);
    const breakdown = results.subjectBreakdown;

    const prompt = `
      You are an expert ENT (Unified National Testing in Kazakhstan) tutor. 
      The student just finished a mock exam. 
      Results: ${JSON.stringify(breakdown)}
      Target Score: ${user.targetScore}
      Target Specialty: ${user.targetSpecialty?.nameRu}
      Subjects: ${user.targetCombination?.subject1.nameRu} and ${user.targetCombination?.subject2.nameRu}.
      
      Analyze their weaknesses and create a 30-day personal study roadmap.
      Focus on subjects where score is low.
      Return the response in strictly valid JSON format with this structure:
      {
        "analysis": "Summary of current state",
        "focusAreas": ["Topic 1", "Topic 2"],
        "weeklyPlan": [
          { "week": 1, "goals": "...", "tasks": ["Task A", "Task B"] },
          ...
        ],
        "tips": ["Tip 1", "Tip 2"]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from markdown if needed
    const jsonString = text.replace(/```json|```/g, "").trim();
    const roadmapData = JSON.parse(jsonString);

    const roadmap = await db.insert(studyRoadmaps).values({
      userId: user.id,
      currentScore: session.score,
      targetScore: user.targetScore,
      daysUntilExam: 30, // Default or calculate from user.examDate
      roadmapData: roadmapData,
      modelVersion: "gemini-1.5-flash",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning();

    return NextResponse.json(roadmap[0]);

  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return NextResponse.json({ error: "AI failed to generate roadmap" }, { status: 500 });
  }
}
