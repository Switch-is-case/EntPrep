import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { usersService } from "@/lib/container";

type RouteContext = { params: Promise<{ id: string }> };

async function getRequesterAdminId(request: NextRequest): Promise<string | null> {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;

  const profile = await usersService.getUserProfile(userId);
  if (!profile || !(profile as any).isAdmin) return null;
  return userId;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const requesterId = await getRequesterAdminId(request);
  if (!requesterId) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const { isAdmin } = await request.json();
    const updated = await usersService.setAdminStatus(requesterId, id, isAdmin);
    return NextResponse.json({ user: updated });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const requesterId = await getRequesterAdminId(request);
  if (!requesterId) {
    return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await usersService.deleteUser(requesterId, id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
