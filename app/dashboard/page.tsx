"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";

type User = {
  name: string;
  email: string;
  role: "admin" | "agent";
} | null;

type VerticalItem = {
  _id: string;
  count: number;
};

type Stats = {
  totalLeads?: number;
  leadsToday?: number;
  totalCalls?: number;
  callsToday?: number;
  conversionRate?: number;
  convertedLeads?: number;
  totalAgents?: number;
  totalTransfers?: number;
  verticalBreakdown?: VerticalItem[];
} | null;

type Lead = {
  _id: string;
  name: string;
  phone?: string;
  vertical?: string;
  status?: string;
};

type Activity = {
  _id: string;
  type: string;
  count?: number;
  vertical?: string;
  agentName?: string;
  date: string;
};

const VERTICAL_COLORS: Record<string, string> = {
  Medicare: "#ef4444",
  "Final Expense": "#f97316",
  "ACA / Health": "#eab308",
  "Auto Insurance": "#22c55e",
  Solar: "#3b82f6",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-950 text-blue-400 border-blue-900/40",
  contacted: "bg-yellow-950 text-yellow-400 border-yellow-900/40",
  qualified: "bg-purple-950 text-purple-400 border-purple-900/40",
  converted: "bg-green-950 text-green-400 border-green-900/40",
  lost: "bg-red-950 text-red-400 border-red-900/40",
};

export default function DashboardPage() {
  const user = useAuth() as User;

  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.get("/api/stats"), api.get("/api/leads"), api.get("/api/activity")])
      .then(([s, l, a]) => {
        if (cancelled) return;

        setStats(s.data);
        setLeads(Array.isArray(l.data) ? l.data.slice(0, 5) : []);
        setActivities(Array.isArray(a.data) ? a.data.slice(0, 8) : []);
      })
      .catch((error) => {
        console.error("Dashboard fetch failed:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const safeUser = mounted ? user : null;
  const authReady = mounted;
  const isAdmin = safeUser?.role === "admin";

  const statCards = useMemo(() => {
    if (isAdmin) {
      return [
        {
          label: "Total Leads",
          value: stats?.totalLeads ?? "—",
          icon: "🎯",
          sub: `${stats?.leadsToday ?? 0} today`,
        },
        {
          label: "Calls Logged",
          value: stats?.totalCalls ?? "—",
          icon: "📞",
          sub: `${stats?.callsToday ?? 0} today`,
        },
        {
          label: "Conversion Rate",
          value: stats?.conversionRate != null ? `${stats.conversionRate}%` : "—",
          icon: "📈",
          sub: `${stats?.convertedLeads ?? 0} converted`,
        },
        {
          label: "Active Agents",
          value: stats?.totalAgents ?? "—",
          icon: "👥",
          sub: "registered agents",
        },
      ];
    }

    return [
      {
        label: "My Leads",
        value: stats?.totalLeads ?? "—",
        icon: "🎯",
        sub: `${stats?.leadsToday ?? 0} today`,
      },
      {
        label: "Calls Logged",
        value: stats?.totalCalls ?? "—",
        icon: "📞",
        sub: `${stats?.callsToday ?? 0} today`,
      },
      {
        label: "Conversion Rate",
        value: stats?.conversionRate != null ? `${stats.conversionRate}%` : "—",
        icon: "📈",
        sub: `${stats?.convertedLeads ?? 0} converted`,
      },
      {
        label: "Live Transfers",
        value: stats?.totalTransfers ?? "—",
        icon: "🔄",
        sub: "total transfers",
      },
    ];
  }, [isAdmin, stats]);

  const totalVerticals =
    stats?.verticalBreakdown?.reduce((sum: number, item: VerticalItem) => sum + item.count, 0) || 1;

  const formattedDate =
    time &&
    time.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const formattedTime =
    time &&
    time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="Dashboard" />

        <main className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-3 sm:space-y-5 sm:p-4 lg:p-5">
          {/* Welcome banner */}
          <div className="relative overflow-hidden rounded-xl border border-red-900/30 bg-gradient-to-r from-[#1a0000] via-[#1e0303] to-[#0f0f0f] p-4 sm:p-5">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239,68,68,0.3) 10px, rgba(239,68,68,0.3) 11px)",
              }}
            />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-red-400 sm:text-xs">
                  {!authReady
                    ? "Workspace"
                    : isAdmin
                    ? "Admin Command Center"
                    : "Agent Workspace"}
                </p>

                <h1 className="break-words text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                  Welcome back,{" "}
                  <span className="text-red-400">
                    {authReady ? safeUser?.name?.split(" ")[0] || "…" : "…"}
                  </span>
                </h1>

                <p className="mt-1 break-words text-[11px] text-gray-500 sm:text-xs">
                  Medicare · Final Expense · ACA · Auto · Solar
                </p>
              </div>

              {/* Mobile time */}
              <div className="rounded-lg border border-white/5 bg-black/20 p-3 md:hidden">
                <p className="text-[11px] text-gray-500">{formattedDate || "—"}</p>
                <p className="tabular-nums text-xl font-black text-white">
                  {formattedTime || "--:--"}
                </p>
              </div>

              {/* Desktop time */}
              <div className="hidden shrink-0 text-right md:block">
                <p className="text-xs text-gray-600">{formattedDate || "—"}</p>
                <p className="tabular-nums text-2xl font-black text-white lg:text-3xl">
                  {formattedTime || "--:--"}
                </p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#111] p-3.5 transition-all duration-200 hover:border-red-900/50 sm:p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative min-w-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xl">{card.icon}</span>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {card.label}
                  </p>

                  <p className="mt-0.5 break-words text-xl font-black text-white tabular-nums sm:text-2xl">
                    {loading ? <span className="text-gray-700">…</span> : card.value}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-700">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-3">
            {/* Left column */}
            <div className="min-w-0 space-y-4 lg:space-y-5 xl:col-span-2">
              {/* Verticals */}
              <div className="rounded-xl border border-white/5 bg-[#111] p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-black text-white">Leads by Vertical</h3>
                  <span className="text-xs text-gray-600">{stats?.totalLeads ?? 0} total</span>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-6 animate-pulse rounded bg-white/5" />
                    ))}
                  </div>
                ) : stats?.verticalBreakdown?.length ? (
                  <div className="space-y-3">
                    {stats.verticalBreakdown.map((vertical) => {
                      const pct = Math.round((vertical.count / totalVerticals) * 100);
                      const color = VERTICAL_COLORS[vertical._id] || "#888";

                      return (
                        <div key={vertical._id} className="min-w-0">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="truncate text-sm text-gray-300">
                                {vertical._id || "Unknown"}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-xs text-gray-600">{vertical.count}</span>
                              <span className="w-8 text-right text-sm font-bold text-white">
                                {pct}%
                              </span>
                            </div>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-gray-600">
                    No leads yet — add your first one!
                  </p>
                )}
              </div>

              {/* Recent leads */}
              <div className="rounded-xl border border-white/5 bg-[#111] p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-black text-white">Recent Leads</h3>
                  <Link
                    href="/leads"
                    className="text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    View all →
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
                    ))}
                  </div>
                ) : leads.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-600">No leads yet.</p>
                    <Link
                      href="/leads/new"
                      className="mt-1 inline-block text-sm text-red-400 hover:underline"
                    >
                      Add your first lead →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leads.map((lead) => (
                      <Link
                        key={lead._id}
                        href={`/leads/${lead._id}`}
                        className="group flex flex-col gap-3 rounded-lg p-3 transition hover:bg-white/5 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-950">
                            <span className="text-xs font-bold text-white">
                              {lead.name?.charAt(0) || "?"}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {lead.name}
                            </p>
                            <p className="truncate text-xs text-gray-600">
                              {lead.phone || "No phone"}
                              {lead.vertical ? ` · ${lead.vertical}` : ""}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`self-start rounded-full border px-2 py-0.5 text-xs font-semibold capitalize sm:self-center ${
                            STATUS_STYLES[lead.status || "new"] || STATUS_STYLES.new
                          }`}
                        >
                          {lead.status || "new"}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="min-w-0 space-y-4">
              {authReady && !isAdmin && (
                <div className="rounded-xl border border-white/5 bg-[#111] p-4">
                  <h3 className="mb-3 text-sm font-black text-white">Quick Actions</h3>

                  <div className="space-y-2">
                    <Link
                      href="/leads/new"
                      className="flex items-center gap-2.5 rounded-lg border border-red-800/30 bg-red-600/10 p-3 transition hover:bg-red-600/20"
                    >
                      <span>🎯</span>
                      <span className="text-sm font-semibold text-red-300">
                        Add New Lead
                      </span>
                    </Link>

                    <Link
                      href="/activity"
                      className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <span>📞</span>
                      <span className="text-sm font-semibold text-gray-300">
                        Log a Call
                      </span>
                    </Link>

                    <Link
                      href="/my-stats"
                      className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <span>📊</span>
                      <span className="text-sm font-semibold text-gray-300">
                        View My Stats
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {authReady && isAdmin && (
                <div className="rounded-xl border border-white/5 bg-[#111] p-4">
                  <h3 className="mb-3 text-sm font-black text-white">Admin Actions</h3>

                  <div className="space-y-2">
                    <Link
                      href="/agents"
                      className="flex items-center gap-2.5 rounded-lg border border-amber-800/30 bg-amber-950/30 p-3 transition hover:bg-amber-950/50"
                    >
                      <span>👥</span>
                      <span className="text-sm font-semibold text-amber-300">
                        Manage Agents
                      </span>
                    </Link>

                    <Link
                      href="/leads"
                      className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <span>🎯</span>
                      <span className="text-sm font-semibold text-gray-300">
                        All Leads
                      </span>
                    </Link>

                    <Link
                      href="/admin/reports"
                      className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <span>📊</span>
                      <span className="text-sm font-semibold text-gray-300">
                        Reports
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Activity */}
              <div className="rounded-xl border border-white/5 bg-[#111] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-white">Activity Log</h3>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    Live
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 animate-pulse rounded bg-white/5" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-600">No activity yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {activities.map((activity) => (
                      <div key={activity._id} className="flex min-w-0 items-start gap-2.5">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            activity.type === "call"
                              ? "bg-orange-800"
                              : activity.type === "lead"
                              ? "bg-red-800"
                              : activity.type === "transfer"
                              ? "bg-blue-800"
                              : activity.type === "conversion"
                              ? "bg-green-800"
                              : "bg-gray-800"
                          }`}
                        >
                          {activity.type === "call"
                            ? "📞"
                            : activity.type === "lead"
                            ? "🎯"
                            : activity.type === "transfer"
                            ? "🔄"
                            : activity.type === "conversion"
                            ? "✅"
                            : "📝"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-xs leading-snug text-gray-300">
                            <span className="font-semibold text-gray-200">
                              {activity.agentName || "Unknown agent"}
                            </span>{" "}
                            logged {activity.count && activity.count > 1 ? `${activity.count}x ` : ""}
                            {activity.type}
                            {activity.vertical ? ` · ${activity.vertical}` : ""}
                          </p>

                          <p className="text-[10px] text-gray-700">
                            {new Date(activity.date).toLocaleDateString()}{" "}
                            {new Date(activity.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
