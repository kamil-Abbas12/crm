import { connectDB } from "../../lib/db";
import Lead from "../../lib/models/Lead";
import Activity from "../../lib/models/Activity";
import User from "../../lib/models/User";
import { getUserFromRequest } from "../../lib/getUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === "admin";
  const filter = isAdmin ? {} : { agentId: user.id };
  const activityFilter = isAdmin ? {} : { agentId: user.id };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalLeads, leadsThisMonth, leadsToday, convertedLeads,
    totalAgents, activities, activitiesToday, verticalBreakdown, statusBreakdown,
  ] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.countDocuments({ ...filter, createdAt: { $gte: startOfMonth } }),
    Lead.countDocuments({ ...filter, createdAt: { $gte: startOfDay } }),
    Lead.countDocuments({ ...filter, status: "converted" }),
    isAdmin ? User.countDocuments({ role: "agent" }) : Promise.resolve(null),
    Activity.aggregate([{ $match: activityFilter }, { $group: { _id: "$type", total: { $sum: "$count" } } }]),
    Activity.aggregate([{ $match: { ...activityFilter, date: { $gte: startOfDay } } }, { $group: { _id: "$type", total: { $sum: "$count" } } }]),
    Lead.aggregate([{ $match: filter }, { $group: { _id: "$vertical", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Lead.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const actMap = Object.fromEntries(activities.map((a: any) => [a._id, a.total]));
  const todayMap = Object.fromEntries(activitiesToday.map((a: any) => [a._id, a.total]));

  return NextResponse.json({
    totalLeads, leadsThisMonth, leadsToday, convertedLeads,
    conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0",
    totalAgents,
    totalCalls: actMap["call"] || 0,
    totalTransfers: actMap["transfer"] || 0,
    callsToday: todayMap["call"] || 0,
    leadsLoggedToday: todayMap["lead"] || 0,
    verticalBreakdown, statusBreakdown,
  });
}