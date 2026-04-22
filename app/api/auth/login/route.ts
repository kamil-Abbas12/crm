import { connectDB } from "../../../lib/db";
import User from "../../../lib/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) return NextResponse.json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return NextResponse.json({ error: "Invalid password" });

  const token = signToken(user);

  return NextResponse.json({ token });
}