import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { progressService } from "@/lib/container";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await progressService.getUserProgress(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}
