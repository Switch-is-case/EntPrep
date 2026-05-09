import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { testService } from "@/services/test.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;

    const details = await testService.getSessionDetails(userId, id);
    if (!details) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("Failed to load session details:", error);
    return NextResponse.json({ error: "Failed to load session details" }, { status: 500 });
  }
}
