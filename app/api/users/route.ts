import { connectDB } from "../../lib/db";
import User from "../../lib/models/User";
import { getUserFromRequest } from "../../lib/getUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  return NextResponse.json(users);
}