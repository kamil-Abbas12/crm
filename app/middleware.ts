import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "../app/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token from all possible sources
  const cookieToken = req.cookies.get("token")?.value;
  const cookieHeader = req.headers.get("cookie") || "";
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  const parsedToken = cookieMatch?.[1];
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = cookieToken || parsedToken || bearerToken;

  const isApiRoute = pathname.startsWith("/api/");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // If on auth page and already logged in → go to dashboard
  if (isAuthRoute && token) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // invalid token, let them stay on login/signup
    }
  }

  // If no token on protected route → redirect to login
  if (!isAuthRoute && !token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If token exists, verify it
  if (token && !isAuthRoute) {
    try {
      const decoded: any = verifyToken(token);
      const adminOnly = ["/admin", "/agents"];
      if (adminOnly.some((r) => pathname.startsWith(r)) && decoded.role !== "admin") {
        if (isApiRoute) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/leads/:path*",
    "/activity/:path*",
    "/agents/:path*",
    "/admin/:path*",
    "/my-stats/:path*",
    "/api/leads/:path*",
    "/api/activity/:path*",
    "/api/stats/:path*",
    "/api/users/:path*",
  ],
};