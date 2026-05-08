import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    language: user.language,
    profileSubject1: user.profileSubject1,
    profileSubject2: user.profileSubject2,
  });
}

export async function PUT(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { language, profileSubject1, profileSubject2, name } =
      await request.json();

    const updateData: Record<string, string | null> = {};
    if (language) updateData.language = language;
    if (name) updateData.name = name;
    if (profileSubject1 !== undefined)
      updateData.profileSubject1 = profileSubject1;
    if (profileSubject2 !== undefined)
      updateData.profileSubject2 = profileSubject2;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      language: updated.language,
      profileSubject1: updated.profileSubject1,
      profileSubject2: updated.profileSubject2,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
