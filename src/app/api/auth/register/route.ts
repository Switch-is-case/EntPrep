import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/container";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, language } = await request.json();

    const result = await authService.register({ email, passwordRaw: password, name, language });
    return NextResponse.json(result);
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
