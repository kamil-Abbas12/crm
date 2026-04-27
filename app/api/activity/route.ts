import { connectDB } from "../../lib/db";
import Activity from "../../lib/models/Activity";
import { getUserFromRequest } from "../../lib/getUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");

  let query: any = {};
  if (user.role === "agent") query.agentId = user.id;
  else if (agentId) query.agentId = agentId;

  const activities = await Activity.find(query).sort({ date: -1 }).limit(100);
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, vertical, count, note } = await req.json();
  if (!type) return NextResponse.json({ error: "Type required" }, { status: 400 });

  const activity = await Activity.create({
    agentId: user.id,
    agentName: user.name,
    type, vertical,
    count: count || 1,
    note,
  });
  return NextResponse.json(activity);
}