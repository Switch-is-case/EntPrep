import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { usersService } from "@/lib/container";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.startsWith("Bearer ") 
    ? request.headers.get("authorization")?.slice(7)
    : request.cookies.get("ent-token")?.value;

  const { verifyToken } = await import("@/lib/auth");
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = payload.userId;
  const validation = await usersService.validateSession(userId, payload.sessionVersion);
  
  if (!validation.valid) {
    console.log("[PROFILE API] Session invalid:", { userId, reason: validation.reason, banReason: validation.banReason });
    return NextResponse.json({ 
      error: "Unauthorized", 
      reason: validation.reason,
      banReason: validation.banReason 
    }, { status: 401 });
  }

  const profile = await usersService.getUserProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Accept all profile fields including Career Wizard results
    const updated = await usersService.updateProfile(userId, body);

    return NextResponse.json(updated);
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
