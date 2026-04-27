"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const VERTICAL_COLORS: Record<string, string> = {
  Medicare: "#ef4444",
  "Final Expense": "#f97316",
  "ACA / Health": "#eab308",
  "Auto Insurance": "#22c55e",
  Solar: "#3b82f6",
};

export default function MyStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/stats"),
      api.get("/api/activity"),
    ]).then(([s, a]) => {
      setStats(s.data);
      setActivities(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalVerticals = stats?.verticalBreakdown?.reduce((s: number, v: any) => s + v.count, 0) || 1;

  // Group activities by day for last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const callsByDay = last7.map(d => ({
    label: new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
    calls: activities.filter(a => a.type === "call" && new Date(a.date).toDateString() === d)
      .reduce((s, a) => s + a.count, 0),
  }));
  const maxCalls = Math.max(...callsByDay.map(d => d.calls), 1);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="My Stats" />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Overview cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: "🎯" },
                { label: "Total Calls", value: stats?.totalCalls ?? "—", icon: "📞" },
                { label: "Conversions", value: stats?.convertedLeads ?? "—", icon: "✅" },
                { label: "Conv. Rate", value: stats ? `${stats.conversionRate}%` : "—", icon: "📈" },
              ].map((s, i) => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-white text-2xl font-black tabular-nums">
                    {loading ? <span className="text-gray-700">…</span> : s.value}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Calls bar chart */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-black text-sm mb-4">Calls — Last 7 Days</h3>
                {loading ? (
                  <div className="h-32 bg-white/5 rounded animate-pulse" />
                ) : (
                  <div className="flex items-end gap-2 h-32">
                    {callsByDay.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-gray-600 text-[10px] tabular-nums">{d.calls || ""}</span>
                        <div
                          className="w-full rounded-t transition-all duration-500"
                          style={{
                            height: `${(d.calls / maxCalls) * 96}px`,
                            minHeight: d.calls > 0 ? "4px" : "0",
                            backgroundColor: d.calls > 0 ? "#ef4444" : "#1f1f1f",
                          }}
                        />
                        <span className="text-gray-600 text-[10px]">{d.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vertical breakdown */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-black text-sm mb-4">My Leads by Vertical</h3>
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
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-gray-300 text-xs">{v._id || "Unknown"}</span>
                            </div>
                            <span className="text-white text-xs font-bold">{v.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-6">No leads yet.</p>
                )}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-5">
              <h3 className="text-white font-black text-sm mb-4">Lead Status Breakdown</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {(["new", "contacted", "qualified", "converted", "lost"] as const).map(status => {
                  const found = stats?.statusBreakdown?.find((s: any) => s._id === status);
                  const count = found?.count ?? 0;
                  const colors: Record<string, string> = {
                    new: "text-blue-400", contacted: "text-yellow-400",
                    qualified: "text-purple-400", converted: "text-green-400", lost: "text-red-400",
                  };
                  return (
                    <div key={status} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
                      <p className={`text-xl font-black tabular-nums ${colors[status]}`}>
                        {loading ? "…" : count}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5 capitalize">{status}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}