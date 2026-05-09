import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { testService } from "@/services/test.service";
import { AnswerInput } from "@/domain/tests/types";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, answers } = (await request.json()) as {
      sessionId: string;
      answers: AnswerInput[];
    };

    const result = await testService.submitTest(userId, sessionId, answers);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Test submit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit test" },
      { status: error.message === "Session not found" ? 404 : 500 }
    );
  }
}
