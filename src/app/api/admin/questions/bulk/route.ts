import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { questionsService } from "@/services/questions.service";

async function checkAdmin(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isAdmin) return null;
  return user;
}

export async function POST(request: NextRequest) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await questionsService.bulkImport(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Bulk import error:", error);
    if (error.message === "Validation errors") {
      return NextResponse.json({ error: "Validation errors", details: error.details }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Import failed" },
      { status: error.message.includes("Maximum") || error.message.includes("Expected") ? 400 : 500 }
    );
  }
}
