import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  sessionVersion?: number;
}

/**
 * Verify JWT signature using jose (edge-compatible)
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract admin data from request (Authorization header or Cookie)
 */
export async function getAdminFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined;

  // 1. Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // 2. Try Cookie
  if (!token) {
    token = request.cookies.get("ent-token")?.value;
  }

  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || !payload.isAdmin) return null;

  return payload;
}

/**
 * Guard for API routes: throws a Response if not authorized
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    // If we have a token but it's not admin, return 403
    const token = request.headers.get("authorization")?.startsWith("Bearer ") 
      ? request.headers.get("authorization")?.slice(7)
      : request.cookies.get("ent-token")?.value;
    
    if (token) {
      const payload = await verifyJWT(token);
      if (payload && !payload.isAdmin) {
        throw new NextResponse(JSON.stringify({ ok: false, error: "Forbidden" }), { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    throw new NextResponse(JSON.stringify({ ok: false, error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  return admin;
}

/**
 * Success response helper
 */
export function createAdminResponse(data: any, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

/**
 * Error response helper
 */
export function createErrorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error }, { status });
}
