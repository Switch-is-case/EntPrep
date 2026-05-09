import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { testService } from "@/services/test.service";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testType } = await request.json(); // 'diagnostic' | 'full' | 'practice'

    const result = await testService.startTest(userId, testType);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Test start error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start test" },
      { status: error.message === "User not found" ? 404 : 500 }
    );
  }
}
