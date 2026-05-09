import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { universitiesService } from "@/services/universities.service";

async function checkAdmin(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isAdmin) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;

  try {
    const allUniversities = await universitiesService.getAllUniversities(search);
    return NextResponse.json({ universities: allUniversities });
  } catch (error) {
    console.error("Admin universities GET error:", error);
    return NextResponse.json({ error: "Failed to load universities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const newUni = await universitiesService.createUniversity(body);
    return NextResponse.json({ success: true, university: newUni });
  } catch (error: any) {
    console.error("Admin universities POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create university" }, 
      { status: error.message.includes("required") ? 400 : 500 }
    );
  }
}
