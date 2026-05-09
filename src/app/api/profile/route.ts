import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { usersService } from "@/services/users.service";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const { language, profileSubject1, profileSubject2, name } = body;

    const updated = await usersService.updateProfile(userId, {
      language,
      name,
      profileSubject1,
      profileSubject2,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
