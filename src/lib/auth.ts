import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET = secret;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string, email: string, isAdmin: boolean = false, sessionVersion: number = 1): string {
  return jwt.sign({ userId, email, isAdmin, sessionVersion }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string; isAdmin: boolean; sessionVersion?: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string; email: string; isAdmin: boolean; sessionVersion?: number };
    return decoded;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}
