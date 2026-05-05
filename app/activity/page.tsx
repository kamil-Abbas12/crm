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
  // ✅ FIXED HERE
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    type: "call",
    vertical: "",
    count: 1,
    note: "",
  });

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

  useEffect(() => {
    fetchLogs();
  }, []);

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

  // 📊 Today's stats
  const today = new Date().toDateString();
  const todayLogs = logs.filter(
    (l) => new Date(l.date).toDateString() === today
  );

  const todayCalls = todayLogs
    .filter((l) => l.type === "call")
    .reduce((s, l) => s + l.count, 0);

  const todayLeads = todayLogs
    .filter((l) => l.type === "lead")
    .reduce((s, l) => s + l.count, 0);

  const todayTransfers = todayLogs
    .filter((l) => l.type === "transfer")
    .reduce((s, l) => s + l.count, 0);

  const todayConversions = todayLogs
    .filter((l) => l.type === "conversion")
    .reduce((s, l) => s + l.count, 0);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar title="Log Activity" />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="max-w-5xl mx-auto space-y-3 sm:space-y-5">

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: "Calls", value: todayCalls, icon: "📞", color: "text-orange-400" },
                { label: "Leads", value: todayLeads, icon: "🎯", color: "text-red-400" },
                { label: "Transfers", value: todayTransfers, icon: "🔄", color: "text-blue-400" },
                { label: "Conversions", value: todayConversions, icon: "✅", color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="bg-[#111] border border-white/5 rounded-xl p-3 text-center">
                  <p>{s.icon}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-gray-600 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">

              {/* Form */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">Log Activity</h3>

                {success && (
                  <div className="mb-3 text-green-400 text-sm">
                    ✅ Activity logged!
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    className="w-full bg-[#1a1a1a] text-white p-2 rounded"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={form.count}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        count: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-[#1a1a1a] text-white p-2 rounded"
                  />

                  <button className="w-full bg-red-600 p-2 rounded text-white">
                    {saving ? "Saving..." : "Submit"}
                  </button>
                </form>
              </div>

              {/* Logs */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">
                  {user?.role === "admin"
                    ? "All Activity"
                    : "My Activity Log"}
                </h3>

                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : logs.length === 0 ? (
                  <p className="text-gray-500">No logs</p>
                ) : (
                  logs.map((log) => (
                    <div key={log._id} className="text-sm text-white mb-2">
                      {log.type} × {log.count}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}