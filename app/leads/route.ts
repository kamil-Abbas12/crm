import { connectDB } from "../lib/db";
import Lead from "../lib/models/Lead";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const leads = await Lead.find().sort({ createdAt: -1 }).limit(50);
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  await connectDB();

  const { name, phone, email, vertical, status } = await req.json();

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Name and phone required" },
      { status: 400 }
    );
  }

  const lead = await Lead.create({ name, phone, email, vertical, status: status || "new" });
  return NextResponse.json(lead);
}