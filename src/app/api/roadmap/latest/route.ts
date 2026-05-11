import { NextResponse } from "next/server";
import { db } from "@/db";
import { studyRoadmaps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // In real app, get userId from auth session
    // For now, we take latest from DB or filter by user
    const latest = await db.query.studyRoadmaps.findFirst({
      orderBy: [desc(studyRoadmaps.generatedAt)],
    });

    if (!latest) return NextResponse.json(null);

    return NextResponse.json(latest);
  } catch (error) {
    console.error("Fetch Roadmap Error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
