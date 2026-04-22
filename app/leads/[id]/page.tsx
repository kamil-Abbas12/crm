"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const VERTICALS = ["Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar"];
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

const STATUS_STYLES: Record<string, string> = {
  new: "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-purple-400",
  converted: "text-green-400",
  lost: "text-red-400",
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/leads/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => setError("Lead not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/leads/${id}`, form);
      setSaved(true);
    } catch {
      setError("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      router.push("/leads");
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Lead Details" />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-600">
              Loading...
            </div>
          ) : error && !form ? (
            <div className="p-4 bg-red-950/60 border border-red-800/50 rounded-lg text-red-400">
              {error}
            </div>
          ) : form ? (
            <div className="max-w-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center">
                    <span className="text-white font-black">{form.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl tracking-tight">{form.name}</h2>
                    <span className={`text-xs font-semibold ${STATUS_STYLES[form.status] || ""}`}>
                      ● {form.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-500 hover:text-red-400 bg-red-950/50 border border-red-900/40 px-3 py-1.5 rounded-lg transition"
                >
                  Delete Lead
                </button>
              </div>
  {saved && (
                <div className="mb-4 p-3 bg-green-950/60 border border-green-800/50 rounded-lg text-green-400 text-sm">
                  ✅ Changes saved successfully
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4">
                {[
                  { name: "name", label: "Full Name", type: "text" },
                  { name: "phone", label: "Phone Number", type: "tel" },
                  { name: "email", label: "Email Address", type: "email" },
                  { name: "agent", label: "Assigned Agent", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/60 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Vertical
                  </label>
                  <select
                    name="vertical"
                    value={form.vertical || ""}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/60 transition-all"
                  >
                    <option value="">Select vertical...</option>
                    {VERTICALS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status || "new"}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/60 transition-all"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition-colors shadow-lg shadow-red-900/30 text-sm"
                  >
                    {saving ? "Saving..." : "Save Changes →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/leads")}
                    className="px-4 bg-white/5 hover:bg-white/10 text-gray-400 font-semibold py-2.5 rounded-lg transition-colors text-sm border border-white/5"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}