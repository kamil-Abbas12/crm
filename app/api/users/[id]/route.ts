import { connectDB } from "../../../lib/db";
import User from "../../../lib/models/User";
import { getUserFromRequest } from "../../../lib/getUser";
import { NextResponse } from "next/server";

// Admin can update user role
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const currentUser = getUserFromRequest(req);
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { role } = await req.json();
    if (!["admin", "agent"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const user = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true, select: "-password" }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

// Admin can delete a user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const currentUser = getUserFromRequest(req);
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "User deleted" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}