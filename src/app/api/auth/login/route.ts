import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const result = await authService.login({ email, passwordRaw: password });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Login error:", error);
    const isClientError = error.message === "Invalid credentials" ||
      error.message === "Email and password are required";
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: isClientError ? 401 : 500 }
    );
  }
}
