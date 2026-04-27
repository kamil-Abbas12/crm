"use client";

import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const VERTICAL_COLORS: Record<string, string> = {
  Medicare: "#ef4444",
  "Final Expense": "#f97316",
  "ACA / Health": "#eab308",
  "Auto Insurance": "#22c55e",
  Solar: "#3b82f6",
};

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/stats"),
      api.get("/api/users"),
    ]).then(([s, a]) => {
      setStats(s.data);
      setAgents(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalVerticals = stats?.verticalBreakdown?.reduce((s: number, v: any) => s + v.count, 0) || 1;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Reports" />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: "🎯" },
                { label: "This Month", value: stats?.leadsThisMonth ?? "—", icon: "📅" },
                { label: "Conversions", value: stats?.convertedLeads ?? "—", icon: "✅" },
                { label: "Total Calls", value: stats?.totalCalls ?? "—", icon: "📞" },
              ].map((s, i) => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-4">
                  <p className="text-xl mb-2">{s.icon}</p>
                  <p className="text-white text-2xl font-black">{loading ? "…" : s.value}</p>
                  <p className="text-gray-600 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Vertical breakdown */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-black text-sm mb-4">All Leads by Vertical</h3>
                {loading ? (
                  <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />)}</div>
                ) : stats?.verticalBreakdown?.length ? (
                  <div className="space-y-3">
                    {stats.verticalBreakdown.map((v: any) => {
                      const pct = Math.round((v.count / totalVerticals) * 100);
                      const color = VERTICAL_COLORS[v._id] || "#888";
                      return (
                        <div key={v._id}>
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-gray-300 text-sm">{v._id || "Unknown"}</span>
                            </div>
                            <span className="text-white text-sm font-bold">{v.count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-6">No data yet.</p>
                )}
              </div>

              {/* Status breakdown */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-black text-sm mb-4">Pipeline Status</h3>
                <div className="space-y-3">
                  {(["new", "contacted", "qualified", "converted", "lost"] as const).map(status => {
                    const found = stats?.statusBreakdown?.find((s: any) => s._id === status);
                    const count = found?.count ?? 0;
                    const total = stats?.totalLeads || 1;
                    const pct = Math.round((count / total) * 100);
                    const colors: Record<string, string> = {
                      new: "#3b82f6", contacted: "#eab308",
                      qualified: "#a855f7", converted: "#22c55e", lost: "#ef4444",
                    };
                    return (
                      <div key={status}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300 text-sm capitalize">{status}</span>
                          <span className="text-white text-sm font-bold">{loading ? "…" : count}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: colors[status] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Agents table */}
            <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h3 className="text-white font-black text-sm">Agent Roster</h3>
                <p className="text-gray-600 text-xs mt-0.5">{agents.filter(a => a.role === "agent").length} agents registered</p>
              </div>
              {loading ? (
                <div className="p-5 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-white/5">
                    <tr>
                      {["Agent", "Email", "Role", "Joined"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-gray-600 font-bold text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/3">
                    {agents.map(a => (
                      <tr key={a._id} className="hover:bg-white/3 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-red-900/50 flex items-center justify-center text-xs font-bold text-red-300">
                              {a.name?.charAt(0)}
                            </div>
                            <span className="text-white font-semibold">{a.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{a.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            a.role === "admin"
                              ? "bg-amber-950 text-amber-400 border-amber-800/40"
                              : "bg-blue-950 text-blue-400 border-blue-800/40"
                          }`}>{a.role}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}