import { connectDB } from "../../../lib/db";
import User from "../../..//lib/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = await req.json();

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashed });

  return NextResponse.json(user);
}