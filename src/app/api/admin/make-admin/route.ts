import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { usersService } from "@/lib/container";
import { createAdminResponse, createErrorResponse } from "@/lib/auth-checks";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return createErrorResponse("Unauthorized - no valid token", 401);
  }

  try {
    const body = await request.json();
    const { adminSecret } = body;

    const updatedUser = await usersService.makeAdmin(userId, adminSecret);

    return createAdminResponse({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error: unknown) {
    console.error("API Error:", error);
    return createErrorResponse("Failed to make admin", 500);
  }
}
