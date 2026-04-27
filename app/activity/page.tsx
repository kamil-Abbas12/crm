"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";

const TYPES = [
  { value: "call", label: "📞 Call", desc: "Outbound or inbound call" },
  { value: "lead", label: "🎯 Lead", desc: "New lead generated" },
  { value: "transfer", label: "🔄 Transfer", desc: "Live transfer completed" },
  { value: "conversion", label: "✅ Conversion", desc: "Lead converted to client" },
  { value: "note", label: "📝 Note", desc: "General note or update" },
];

const VERTICALS = ["Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar", "Other"];

const TYPE_STYLES: Record<string, string> = {
  call: "bg-orange-950 text-orange-400 border-orange-900/40",
  lead: "bg-red-950 text-red-400 border-red-900/40",
  transfer: "bg-blue-950 text-blue-400 border-blue-900/40",
  conversion: "bg-green-950 text-green-400 border-green-900/40",
  note: "bg-gray-900 text-gray-400 border-gray-700/40",
};

export default function ActivityPage() {
  const user = useAuth();
  const [form, setForm] = useState({ type: "call", vertical: "", count: 1, note: "" });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchLogs = () => {
    api.get("/api/activity").then(r => setLogs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/activity", form);
      setSuccess(true);
      setForm({ type: "call", vertical: "", count: 1, note: "" });
      fetchLogs();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to log activity");
    } finally {
      setSaving(false);
    }
  };

  // Compute today's totals
  const today = new Date().toDateString();
  const todayLogs = logs.filter(l => new Date(l.date).toDateString() === today);
  const todayCalls = todayLogs.filter(l => l.type === "call").reduce((s, l) => s + l.count, 0);
  const todayLeads = todayLogs.filter(l => l.type === "lead").reduce((s, l) => s + l.count, 0);
  const todayTransfers = todayLogs.filter(l => l.type === "transfer").reduce((s, l) => s + l.count, 0);
  const todayConversions = todayLogs.filter(l => l.type === "conversion").reduce((s, l) => s + l.count, 0);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Log Activity" />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Today summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Calls", value: todayCalls, icon: "📞", color: "text-orange-400" },
                { label: "Leads", value: todayLeads, icon: "🎯", color: "text-red-400" },
                { label: "Transfers", value: todayTransfers, icon: "🔄", color: "text-blue-400" },
                { label: "Conversions", value: todayConversions, icon: "✅", color: "text-green-400" },
              ].map(s => (
                <div key={s.label} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-xl">{s.icon}</p>
                  <p className={`text-2xl font-black ${s.color} tabular-nums`}>{s.value}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{s.label} today</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Log form */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-black text-base mb-4">Log New Activity</h3>

                {success && (
                  <div className="mb-4 p-3 bg-green-950/60 border border-green-800/40 rounded-lg text-green-400 text-sm flex items-center gap-2">
                    ✅ Activity logged successfully!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-2">Activity Type</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {TYPES.map(t => (
                        <button
                          key={t.value} type="button"
                          onClick={() => setForm({ ...form, type: t.value })}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition ${
                            form.type === t.value
                              ? "bg-red-600/15 border-red-700/50 text-white"
                              : "bg-white/3 border-white/8 text-gray-500 hover:border-white/20"
                          }`}
                        >
                          <span className="text-base w-5 text-center">{t.label.split(" ")[0]}</span>
                          <div>
                            <p className="text-sm font-semibold leading-tight">{t.label.split(" ").slice(1).join(" ")}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{t.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5">Vertical</label>
                      <select
                        value={form.vertical}
                        onChange={e => setForm({ ...form, vertical: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-700/50 transition"
                      >
                        <option value="">All verticals</option>
                        {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5">Count</label>
                      <input
                        type="number" min="1" max="999"
                        value={form.count}
                        onChange={e => setForm({ ...form, count: parseInt(e.target.value) || 1 })}
                        className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-700/50 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5">Note (optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Any additional details…"
                      value={form.note}
                      onChange={e => setForm({ ...form, note: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/50 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={saving}
                    className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30"
                  >
                    {saving ? "Logging…" : "Log Activity →"}
                  </button>
                </form>
              </div>

              {/* History */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                <h3 className="text-white font-black text-base mb-4">
                  {user?.role === "admin" ? "All Activity" : "My Activity Log"}
                </h3>
                {loading ? (
                  <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
                ) : logs.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-8">No activity logged yet.</p>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
                    {logs.map((log: any) => (
                      <div key={log._id} className="flex items-start gap-3 p-2.5 bg-white/3 rounded-lg border border-white/5">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border shrink-0 ${TYPE_STYLES[log.type] || TYPE_STYLES.note}`}>
                          {log.type}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {user?.role === "admin" && (
                              <span className="text-gray-400 text-xs font-semibold">{log.agentName}</span>
                            )}
                            {log.vertical && <span className="text-gray-600 text-xs">· {log.vertical}</span>}
                            {log.count > 1 && (
                              <span className="text-xs text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">×{log.count}</span>
                            )}
                          </div>
                          {log.note && <p className="text-gray-500 text-xs mt-0.5 truncate">{log.note}</p>}
                          <p className="text-gray-700 text-[10px] mt-0.5">
                            {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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