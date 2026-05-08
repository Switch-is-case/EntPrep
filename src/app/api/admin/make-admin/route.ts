import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

// This endpoint allows the first user to become admin, or requires admin secret
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  console.log("Make admin - Auth header:", authHeader ? "present" : "missing");
  
  const userId = getUserIdFromRequest(request);
  console.log("Make admin - User ID:", userId);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized - no valid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { adminSecret } = body;

    // Check if there are any admins
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isAdmin, true));

    const hasAdmins = Number(adminCount.count) > 0;

    // If no admins exist, the first person to request becomes admin
    // Or if the secret matches, grant admin
    const secretValid = adminSecret === (process.env.ADMIN_SECRET || "entadmin2024");

    if (!hasAdmins || secretValid) {
      const [updated] = await db
        .update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, userId))
        .returning();

      return NextResponse.json({
        success: true,
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          isAdmin: updated.isAdmin,
        },
      });
    }

    return NextResponse.json(
      { error: "Admin already exists. Use admin secret to become admin." },
      { status: 403 }
    );
  } catch (error) {
    console.error("Make admin error:", error);
    return NextResponse.json(
      { error: "Failed to make admin" },
      { status: 500 }
    );
  }
}
