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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });

  try {
    const { id } = await context.params;
    const uniId = parseInt(id);
    const body = await request.json();

    const updated = await universitiesService.updateUniversity(uniId, body);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, university: updated });
  } catch (error: any) {
    console.error("Admin universities PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update university" }, 
      { status: error.message.includes("empty strings") ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminUser = await checkAdmin(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });

  try {
    const { id } = await context.params;
    const uniId = parseInt(id);

    await universitiesService.deleteUniversity(uniId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin universities DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete university" }, { status: 500 });
  }
}
