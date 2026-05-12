import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth-checks";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/** (Pages)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("ent-token")?.value;
    
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    if (!payload.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect /api/admin/** (API)
  if (pathname.startsWith("/api/admin")) {
    // Skip /api/admin/make-admin if it's used for bootstrap (though usually it should be protected too)
    if (pathname === "/api/admin/make-admin") return NextResponse.next();

    let token = request.cookies.get("ent-token")?.value;
    
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return new NextResponse(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return new NextResponse(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!payload.isAdmin) {
      return new NextResponse(JSON.stringify({ ok: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
