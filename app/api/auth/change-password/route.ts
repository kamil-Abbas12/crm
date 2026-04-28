import { connectDB } from "../../../lib/db";
import User from "../../../lib/models/User";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "../../../lib/getUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Both fields required" }, { status: 400 });
  if (newPassword.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const dbUser = await User.findById(user.id);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  dbUser.password = await bcrypt.hash(newPassword, 10);
  await dbUser.save();
  return NextResponse.json({ message: "Password updated successfully" });
}