import { NextResponse } from "next/server";
import { getUserFromRequest } from "../../lib/getUser";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const authHeader = req.headers.get("authorization") || "";
  const user = getUserFromRequest(req);

  return NextResponse.json({
    decodedUser: user,
    cookieHeader: cookieHeader.substring(0, 200),
    authHeader: authHeader.substring(0, 100),
  });
}