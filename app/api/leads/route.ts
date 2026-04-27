import { connectDB } from "../../lib/db";
import Lead from "../../lib/models/Lead";
import { getUserFromRequest } from "../../lib/getUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = user.role === "admin" ? {} : { agentId: user.id };
  const leads = await Lead.find(query).sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, email, vertical, status, agent } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: "Name and phone required" }, { status: 400 });

  const lead = await Lead.create({
    name, phone, email, vertical,
    status: status || "new",
    agent: agent || user.name,
    agentId: user.id,
  });
  return NextResponse.json(lead);
}