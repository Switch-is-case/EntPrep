import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/container";
import { db } from "@/db";
import { emailVerificationTokens } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { getVerificationEmail } from "@/lib/email-templates/verification";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, language } = await request.json();

    const result = await authService.register({ email, passwordRaw: password, name, language });
    
    // Send verification email
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(emailVerificationTokens).values({
        userId: result.user.id,
        token,
        expiresAt,
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/verify-email?token=${token}`;

      const { subject, html, text } = getVerificationEmail({
        userName: result.user.name,
        verificationUrl,
        lang: (result.user.language as "ru" | "kz" | "en") || "ru",
      });

      await sendEmail({
        to: result.user.email,
        subject,
        html,
        text,
      });
    } catch (emailError) {
      console.warn("Failed to send initial verification email:", emailError);
      // We don't fail the registration if email fails, user can resend later
    }

    const response = NextResponse.json(result);
    response.cookies.set("ent-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
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
