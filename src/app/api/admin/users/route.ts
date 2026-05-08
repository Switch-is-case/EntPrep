import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc, sql, ilike, or } from "drizzle-orm";

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

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  try {
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        language: users.language,
        profileSubject1: users.profileSubject1,
        profileSubject2: users.profileSubject2,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users);

    if (search) {
      query = query.where(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      ) as typeof query;
    }

    const allUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    return NextResponse.json({
      users: allUsers,
      total: Number(totalCount.count),
      page,
      limit,
      totalPages: Math.ceil(Number(totalCount.count) / limit),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}
