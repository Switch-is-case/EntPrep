import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjectCombinations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const combinations = await db.query.subjectCombinations.findMany({
      where: eq(subjectCombinations.isActive, true),
      with: {
        subject1: true,
        subject2: true,
      },
      orderBy: [asc(subjectCombinations.id)],
    });

    return NextResponse.json(combinations);
  } catch (error) {
    console.error("Failed to fetch combinations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
