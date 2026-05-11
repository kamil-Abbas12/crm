"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../hooks/useAuth";

const TYPES = [
  { value: "call",       label: "📞 Call",       desc: "Outbound or inbound call" },
  { value: "lead",       label: "🎯 Lead",       desc: "New lead generated" },
  { value: "transfer",   label: "🔄 Transfer",   desc: "Live transfer completed" },
  { value: "conversion", label: "✅ Conversion", desc: "Lead converted to client" },
  { value: "note",       label: "📝 Note",       desc: "General note or update" },
];

const VERTICALS = ["Medicare","Final Expense","ACA / Health","Auto Insurance","Solar","Other"];

const TYPE_STYLES: Record<string, string> = {
  call:       "bg-orange-950 text-orange-400 border-orange-900/40",
  lead:       "bg-red-950 text-red-400 border-red-900/40",
  transfer:   "bg-[#003380]/40 text-[#00b4ff] border-[#0066cc]/30",
  conversion: "bg-green-950 text-green-400 border-green-900/40",
  note:       "bg-[#1e3a5f]/20 text-[#4a7aaa] border-[#1e3a5f]/40",
};

export default function ActivityPage() {
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({ type: "call", vertical: "", count: 1, note: "" });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchLogs = () => {
    api
      .get("/api/activity")
      .then((r) => setLogs(r.data))
      .finally(() => setLoading(false));
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

  const today = new Date().toDateString();
  const todayLogs = logs.filter((l) => new Date(l.date).toDateString() === today);
  const todayCalls      = todayLogs.filter((l) => l.type === "call").reduce((s, l) => s + l.count, 0);
  const todayLeads      = todayLogs.filter((l) => l.type === "lead").reduce((s, l) => s + l.count, 0);
  const todayTransfers  = todayLogs.filter((l) => l.type === "transfer").reduce((s, l) => s + l.count, 0);
  const todayConversions= todayLogs.filter((l) => l.type === "conversion").reduce((s, l) => s + l.count, 0);

  const inputCls =
    "w-full rounded-lg border border-[#1e3a5f]/50 bg-[#060d1a] px-3 py-2.5 text-sm text-white placeholder:text-[#3a5a8a] outline-none transition focus:border-[#00b4ff]/60";

  const selectCls =
    "w-full rounded-lg border border-[#1e3a5f]/50 bg-[#060d1a] px-3 py-2.5 text-sm text-[#8ab4d4] outline-none transition focus:border-[#00b4ff]/60";

  return (
    <div className="flex min-h-screen bg-[#060d1a]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar title="Log Activity" />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="max-w-5xl mx-auto space-y-3 sm:space-y-5">

            {/* Today's summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: "Calls",       value: todayCalls,       icon: "📞", color: "text-orange-400" },
                { label: "Leads",       value: todayLeads,       icon: "🎯", color: "text-red-400" },
                { label: "Transfers",   value: todayTransfers,   icon: "🔄", color: "text-[#00b4ff]" },
                { label: "Conversions", value: todayConversions, icon: "✅", color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-3 text-center">
                  <p>{s.icon}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[#3a5a8a] text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">

              {/* Form */}
              <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">Log Activity</h3>

                {success && (
                  <div className="mb-3 p-2.5 rounded-lg bg-[#003820]/60 border border-[#00aa55]/30 text-[#00cc66] text-sm">
                    ✅ Activity logged!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={selectCls}
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={form.count}
                    onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })}
                    className={inputCls}
                  />

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#0066cc] hover:bg-[#0080ff] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-[#0066cc]/30"
                  >
                    {saving ? "Saving..." : "Submit"}
                  </button>
                </form>
              </div>

              {/* Logs */}
              <div className="bg-[#0a0f1e] border border-[#1e3a5f]/40 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">
                  {user?.role === "admin" ? "All Activity" : "My Activity Log"}
                </h3>

                {loading ? (
                  <p className="text-[#4a7aaa] text-sm">Loading...</p>
                ) : logs.length === 0 ? (
                  <p className="text-[#4a7aaa] text-sm">No logs</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log._id}
                        className="flex items-center gap-3 rounded-lg border border-[#1e3a5f]/30 bg-[#1e3a5f]/10 px-3 py-2"
                      >
                        <span
                          className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            TYPE_STYLES[log.type] || TYPE_STYLES.note
                          }`}
                        >
                          {log.type}
                        </span>
                        <span className="text-sm text-white font-semibold">× {log.count}</span>
                        {log.note && (
                          <span className="text-xs text-[#4a7aaa] truncate">{log.note}</span>
                        )}
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