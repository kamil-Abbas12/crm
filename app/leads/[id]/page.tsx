"use client";

import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const VERTICALS = ["Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar"];
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/api/leads/${id}`)
      .then(r => setForm(r.data))
      .catch(() => setError("Lead not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/leads/${id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead?")) return;
    await api.delete(`/api/leads/${id}`);
    router.push("/leads");
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar /><div className="flex-1 flex flex-col"><Topbar title="Lead" />
        <div className="flex-1 flex items-center justify-center text-gray-600">Loading…</div></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Edit Lead" />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-md">
            {error && !form && (
              <div className="p-3 bg-red-950/60 border border-red-800/40 rounded-lg text-red-400 text-sm mb-4">{error}</div>
            )}

            {form && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center">
                      <span className="text-white font-black">{form.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="text-white font-black text-xl">{form.name}</h2>
                      <p className="text-gray-600 text-xs">{form.phone}</p>
                    </div>
                  </div>
                  <button onClick={handleDelete}
                    className="text-xs text-red-500 hover:text-red-400 bg-red-950/40 border border-red-900/30 px-3 py-1.5 rounded-lg transition">
                    Delete
                  </button>
                </div>

                {saved && (
                  <div className="mb-4 p-3 bg-green-950/60 border border-green-800/40 rounded-lg text-green-400 text-sm">✅ Saved!</div>
                )}

                <form onSubmit={handleSave} className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-4">
                  {[
                    { name: "name", label: "Full Name", type: "text" },
                    { name: "phone", label: "Phone", type: "tel" },
                    { name: "email", label: "Email", type: "email" },
                    { name: "agent", label: "Assigned Agent", type: "text" },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5">{f.label}</label>
                      <input name={f.name} type={f.type} value={form[f.name] || ""}
                        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/50 transition" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5">Vertical</label>
                    <select value={form.vertical || ""} onChange={e => setForm({ ...form, vertical: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/50 transition">
                      <option value="">Select…</option>
                      {VERTICALS.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs font-bold tracking-widest uppercase mb-1.5">Status</label>
                    <select value={form.status || "new"} onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/50 transition">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition text-sm shadow-lg shadow-red-900/30">
                      {saving ? "Saving…" : "Save Changes →"}
                    </button>
                    <button type="button" onClick={() => router.push("/leads")}
                      className="px-4 bg-white/5 hover:bg-white/10 text-gray-400 py-2.5 rounded-lg transition text-sm border border-white/5">
                      Back
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}