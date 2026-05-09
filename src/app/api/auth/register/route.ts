import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, language } = await request.json();

    const result = await authService.register({ email, passwordRaw: password, name, language });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Register error:", error);
    const status = error.message === "Email already registered" ? 409
      : error.message?.includes("required") ? 400
      : 500;
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status }
    );
  }
}
