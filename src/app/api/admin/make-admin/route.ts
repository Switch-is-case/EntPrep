import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { usersService } from "@/lib/container";

// This endpoint allows the first user to become admin, or requires admin secret
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const userId = getUserIdFromRequest(request);

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
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
