import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email";
import { getVerificationEmail } from "@/lib/email-templates/verification";
import crypto from "crypto";

export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });
  }

  const rateLimit = await checkRateLimit(userId, "EMAIL_VERIFICATION");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // Invalidate previous tokens
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        isNull(emailVerificationTokens.usedAt)
      )
    );

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(emailVerificationTokens).values({
    userId,
    token,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

  try {
    const { subject, html, text } = getVerificationEmail({
      userName: user.name,
      verificationUrl,
      lang: (user.language as "ru" | "kz" | "en") || "ru",
    });

    await sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
