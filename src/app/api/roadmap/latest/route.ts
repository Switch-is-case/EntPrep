import { NextResponse } from "next/server";
import { db } from "@/db";
import { studyRoadmaps } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latest = await db.query.studyRoadmaps.findFirst({
      where: eq(studyRoadmaps.userId, userId),
      orderBy: [desc(studyRoadmaps.generatedAt)],
    });

    if (!latest) return NextResponse.json({ error: "No roadmap found" }, { status: 404 });

    return NextResponse.json(latest);
  } catch (error) {
    console.error("Fetch Roadmap Error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
