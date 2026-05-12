import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Guard for API routes (Node runtime)
 */
export async function requireVerifiedEmail(userId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { emailVerified: true },
  });
  
  if (!user) return { ok: false, error: "User not found" };
  if (!user.emailVerified) return { ok: false, error: "Email not verified" };
  
  return { ok: true };
}
