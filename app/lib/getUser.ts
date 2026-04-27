import { verifyToken } from "./auth";

export function getUserFromRequest(req: Request): any | null {
  try {
    // Method 1: Authorization header (from axios interceptor)
    const auth = req.headers.get("Authorization") || req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      return verifyToken(token) as any;
    }

    // Method 2: Cookie header (sent automatically by browser)
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) {
      return verifyToken(match[1]) as any;
    }

    return null;
  } catch {
    return null;
  }
}