import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { usersService } from "@/services/users.service";

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

    const updatedUser = await usersService.makeAdmin(userId, adminSecret);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error: any) {
    console.error("Make admin error:", error);
    const isForbidden = error.message?.includes("Admin already exists");
    return NextResponse.json(
      { error: error.message || "Failed to make admin" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
