import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { testService } from "@/lib/container";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sessions = await testService.getUserHistory(userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to load history:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
