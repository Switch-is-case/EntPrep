import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const tokenData = await db.query.emailVerificationTokens.findFirst({
    where: eq(emailVerificationTokens.token, token),
  });

  // 4. If token NOT found → return 400 { error: "Invalid token" }
  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // 5. If token found BUT usedAt is NOT null → return 200 { message: "Email already verified" }
  if (tokenData.usedAt) {
    revalidatePath("/", "layout");
    return NextResponse.json({ message: "Email already verified" }, { status: 200 });
  }

  // 6. If token found BUT expiresAt < new Date() → return 400 { error: "Token expired" }
  if (new Date() > tokenData.expiresAt) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  try {
    // 7. If token is valid (usedAt is null AND not expired):
    await db.transaction(async (tx: any) => {
      // a. UPDATE users SET emailVerified = true, emailVerifiedAt = new Date()
      await tx
        .update(users)
        .set({
          emailVerified: true,
          emailVerifiedAt: new Date(),
        })
        .where(eq(users.id, tokenData.userId));

      // b. UPDATE emailVerificationTokens SET usedAt = new Date() WHERE token = token
      await tx
        .update(emailVerificationTokens)
        .set({ usedAt: new Date() })
        .where(eq(emailVerificationTokens.token, token));
    });

    // 8. Return 200 { message: "Email verified successfully" }
    revalidatePath("/", "layout");
    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
