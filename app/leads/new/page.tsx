"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/RecentLeads";
import Topbar from "../../components/Topbar";

const VERTICALS = ["Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar"];
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    vertical: "",
    status: "new",
    agent: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/leads", form);
      router.push("/leads");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="New Lead" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-white font-black text-xl tracking-tight">Add New Lead</h2>
              <p className="text-gray-600 text-sm mt-1">Enter lead details below</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-800/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4">
              {[
                { name: "name", label: "Full Name", type: "text", placeholder: "John Smith", required: true },
                { name: "phone", label: "Phone Number", type: "tel", placeholder: "555-0100", required: true },
                { name: "email", label: "Email Address", type: "email", placeholder: "john@email.com", required: false },
                { name: "agent", label: "Assigned Agent", type: "text", placeholder: "Agent name", required: false },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    value={(form as any)[field.name]}
                    required={field.required}
                    className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white placeholder-gray-700 text-sm outline-none focus:border-red-700/60 transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Vertical
                </label>
                <select
                  name="vertical"
                  value={form.vertical}
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
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a1a] border border-white/8 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-red-700/60 transition-all"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-2.5 rounded-lg transition-colors shadow-lg shadow-red-900/30 text-sm"
                >
                  {loading ? "Saving..." : "Save Lead →"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 bg-white/5 hover:bg-white/10 text-gray-400 font-semibold py-2.5 rounded-lg transition-colors text-sm border border-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}