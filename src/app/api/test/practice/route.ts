import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { testService } from "@/services/test.service";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, count = 10 } = await request.json();

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const result = await testService.startPractice(subject, count);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Practice error:", error);
    return NextResponse.json({ error: "Failed to load practice questions" }, { status: 500 });
  }
}
