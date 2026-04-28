"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";

const VERTICAL_COLORS: Record<string, string> = {
  Medicare: "#ef4444", "Final Expense": "#f97316",
  "ACA / Health": "#eab308", "Auto Insurance": "#22c55e", Solar: "#3b82f6",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-950 text-blue-400 border-blue-900/40",
  contacted: "bg-yellow-950 text-yellow-400 border-yellow-900/40",
  qualified: "bg-purple-950 text-purple-400 border-purple-900/40",
  converted: "bg-green-950 text-green-400 border-green-900/40",
  lost: "bg-red-950 text-red-400 border-red-900/40",
};

export default function DashboardPage() {
  const user = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/api/stats"),
      api.get("/api/leads"),
      api.get("/api/activity"),
    ]).then(([s, l, a]) => {
      setStats(s.data);
      setLeads(l.data.slice(0, 5));
      setActivities(a.data.slice(0, 8));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === "admin";
  const totalVerticals = stats?.verticalBreakdown?.reduce((s: number, v: any) => s + v.count, 0) || 1;

  const statCards = isAdmin ? [
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: "🎯", sub: `${stats?.leadsToday ?? 0} today` },
    { label: "Calls Logged", value: stats?.totalCalls ?? "—", icon: "📞", sub: `${stats?.callsToday ?? 0} today` },
    { label: "Conversion Rate", value: stats ? `${stats.conversionRate}%` : "—", icon: "📈", sub: `${stats?.convertedLeads ?? 0} converted` },
    { label: "Active Agents", value: stats?.totalAgents ?? "—", icon: "👥", sub: "registered agents" },
  ] : [
    { label: "My Leads", value: stats?.totalLeads ?? "—", icon: "🎯", sub: `${stats?.leadsToday ?? 0} today` },
    { label: "Calls Logged", value: stats?.totalCalls ?? "—", icon: "📞", sub: `${stats?.callsToday ?? 0} today` },
    { label: "Conversion Rate", value: stats ? `${stats.conversionRate}%` : "—", icon: "📈", sub: `${stats?.convertedLeads ?? 0} converted` },
    { label: "Live Transfers", value: stats?.totalTransfers ?? "—", icon: "🔄", sub: "total transfers" },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">

        {/* Welcome banner */}
        <div className="relative rounded-xl border border-red-900/30 bg-gradient-to-r from-[#1a0000] via-[#1e0303] to-[#0f0f0f] p-4 sm:p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239,68,68,0.3) 10px, rgba(239,68,68,0.3) 11px)` }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-red-400 text-xs font-bold tracking-widest uppercase mb-1">
                {isAdmin ? "Admin Command Center" : "Agent Workspace"}
              </p>
              <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight">
                Welcome back, <span className="text-red-400">{user?.name?.split(" ")[0] || "…"}</span>
              </h1>
              <p className="text-gray-500 text-xs mt-1 hidden sm:block">Medicare · Final Expense · ACA · Auto · Solar</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-gray-600 text-xs">{time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
              <p className="text-white text-2xl sm:text-3xl font-black tabular-nums">
                {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <div key={i} className="group bg-[#111] border border-white/5 rounded-xl p-3 sm:p-4 hover:border-red-900/50 transition-all relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-red-950/20 to-transparent" />
              <div className="relative">
                <span className="text-lg sm:text-xl">{s.icon}</span>
                <p className="text-gray-600 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-2">{s.label}</p>
                <p className="text-white text-xl sm:text-2xl font-black mt-0.5 tabular-nums">
                  {loading ? <span className="text-gray-700">…</span> : s.value}
                </p>
                <p className="text-gray-700 text-[10px] mt-0.5 hidden sm:block">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
          <div className="xl:col-span-2 space-y-4 sm:space-y-5">

            {/* Verticals */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-sm">Leads by Vertical</h3>
                <span className="text-xs text-gray-600">{stats?.totalLeads ?? 0} total</span>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />)}</div>
              ) : stats?.verticalBreakdown?.length ? (
                <div className="space-y-3">
                  {stats.verticalBreakdown.map((v: any) => {
                    const pct = Math.round((v.count / totalVerticals) * 100);
                    const color = VERTICAL_COLORS[v._id] || "#888";
                    return (
                      <div key={v._id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-gray-300 text-xs sm:text-sm truncate">{v._id || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-gray-600 text-xs hidden sm:inline">{v.count}</span>
                            <span className="text-white text-xs sm:text-sm font-bold w-7 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-sm text-center py-4">No leads yet.</p>
              )}
            </div>

            {/* Recent leads */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-sm">Recent Leads</h3>
                <Link href="/leads" className="text-red-400 hover:text-red-300 text-xs font-semibold">View all →</Link>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
              ) : leads.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 text-sm">No leads yet.</p>
                  <Link href="/leads/new" className="text-red-400 text-sm hover:underline mt-1 inline-block">Add first lead →</Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {leads.map(lead => (
                    <Link key={lead._id} href={`/leads/${lead._id}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-white/5 transition">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{lead.name?.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs sm:text-sm font-semibold truncate">{lead.name}</p>
                        <p className="text-gray-600 text-xs truncate hidden sm:block">{lead.phone}{lead.vertical ? ` · ${lead.vertical}` : ""}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                        {lead.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-4">
              <h3 className="text-white font-black text-sm mb-3">{isAdmin ? "Admin Actions" : "Quick Actions"}</h3>
              <div className="space-y-2">
                {isAdmin ? (
                  <>
                    <Link href="/agents" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/30 hover:bg-amber-950/50 transition">
                      <span>👥</span><span className="text-amber-300 text-sm font-semibold">Manage Agents</span>
                    </Link>
                    <Link href="/leads" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition">
                      <span>🎯</span><span className="text-gray-300 text-sm font-semibold">All Leads</span>
                    </Link>
                    <Link href="/admin/reports" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition">
                      <span>📊</span><span className="text-gray-300 text-sm font-semibold">Reports</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/leads/new" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-600/10 border border-red-800/30 hover:bg-red-600/20 transition">
                      <span>🎯</span><span className="text-red-300 text-sm font-semibold">Add New Lead</span>
                    </Link>
                    <Link href="/activity" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition">
                      <span>📞</span><span className="text-gray-300 text-sm font-semibold">Log a Call</span>
                    </Link>
                    <Link href="/my-stats" className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 transition">
                      <span>📊</span><span className="text-gray-300 text-sm font-semibold">View My Stats</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-black text-sm">Activity Log</h3>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />)}</div>
              ) : activities.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">No activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {activities.map((a: any) => (
                    <div key={a._id} className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        a.type === "call" ? "bg-orange-800" : a.type === "lead" ? "bg-red-800" :
                        a.type === "transfer" ? "bg-blue-800" : a.type === "conversion" ? "bg-green-800" : "bg-gray-800"
                      }`}>
                        {a.type === "call" ? "📞" : a.type === "lead" ? "🎯" : a.type === "transfer" ? "🔄" : a.type === "conversion" ? "✅" : "📝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 text-xs leading-snug truncate">
                          <span className="font-semibold text-gray-200">{a.agentName}</span> logged {a.type}
                          {a.vertical ? ` · ${a.vertical}` : ""}
                        </p>
                        <p className="text-gray-700 text-[10px]">
                          {new Date(a.date).toLocaleDateString()} {new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}