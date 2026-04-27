"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-950 text-blue-400 border-blue-900/40",
  contacted: "bg-yellow-950 text-yellow-400 border-yellow-900/40",
  qualified: "bg-purple-950 text-purple-400 border-purple-900/40",
  callback: "bg-orange-950 text-orange-400 border-orange-900/40",
  appointment_set: "bg-cyan-950 text-cyan-400 border-cyan-900/40",
  applied: "bg-indigo-950 text-indigo-400 border-indigo-900/40",
  converted: "bg-green-950 text-green-400 border-green-900/40",
  not_interested: "bg-gray-900 text-gray-500 border-gray-700/40",
  do_not_call: "bg-red-950 text-red-500 border-red-900/40",
  lost: "bg-red-950 text-red-400 border-red-900/40",
};

const DISPOSITION_BADGE: Record<string, string> = {
  hot: "🔥", warm: "🌡", cold: "❄️",
};

const VERTICALS = ["All", "Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar", "Mortgage Protection", "Life Insurance", "Annuity", "Other"];
const STATUSES = ["All", "new", "contacted", "qualified", "callback", "appointment_set", "applied", "converted", "not_interested", "do_not_call", "lost"];
const SOURCES = ["All", "Live Transfer", "Inbound Call", "Direct Mail", "Facebook", "Google", "Referral", "Cold Call", "TV Ad", "Other"];

export default function LeadsPage() {
  const user = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState("All");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    api.get("/api/leads").then(r => setLeads(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = leads
    .filter(l => {
      const s = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.zipCode?.includes(search);
      const v = vertical === "All" || l.vertical === vertical;
      const st = status === "All" || l.status === status;
      const so = source === "All" || l.leadSource === source;
      return s && v && st && so;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "calls") return (b.callCount || 0) - (a.callCount || 0);
      if (sortBy === "name") return a.name?.localeCompare(b.name);
      return 0;
    });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await api.delete(`/api/leads/${id}`);
    setLeads(prev => prev.filter(l => l._id !== id));
  };

  // Summary stats
  const totalCalls = leads.reduce((s, l) => s + (l.callCount || 0), 0);
  const totalAnswered = leads.reduce((s, l) => s + (l.callsAnswered || 0), 0);
  const converted = leads.filter(l => l.status === "converted").length;
  const hotLeads = leads.filter(l => l.disposition === "hot").length;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={user?.role === "admin" ? "All Leads" : "My Leads"} />
        <main className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Leads", value: leads.length, icon: "🎯", color: "text-white" },
              { label: "Total Calls Made", value: totalCalls, icon: "📞", color: "text-orange-400" },
              { label: "Calls Answered", value: totalAnswered, icon: "✅", color: "text-green-400" },
              { label: "Hot Leads", value: hotLeads, icon: "🔥", color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="bg-[#111] border border-white/5 rounded-xl p-3 text-center">
                <p className="text-base">{s.icon}</p>
                <p className={`text-xl font-black ${s.color} tabular-nums`}>{loading ? "…" : s.value}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-black text-xl">{user?.role === "admin" ? "All Leads" : "My Leads"}</h2>
              <p className="text-gray-600 text-sm">{filtered.length} of {leads.length} leads</p>
            </div>
            <Link href="/leads/new"
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-red-900/30">
              ＋ Add Lead
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-[#111] border border-white/5 rounded-xl p-4 flex flex-wrap gap-3 items-center">
            <input type="text" placeholder="Search name, phone, zip…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm outline-none focus:border-red-700/50 transition w-52" />
            <select value={vertical} onChange={e => setVertical(e.target.value)}
              className="bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:border-red-700/50 transition">
              {VERTICALS.map(v => <option key={v}>{v}</option>)}
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:border-red-700/50 transition">
              {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.replace(/_/g, " ")}</option>)}
            </select>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:border-red-700/50 transition">
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-[#1a1a1a] border border-white/8 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:border-red-700/50 transition">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="calls">Most calls</option>
              <option value="name">Name A–Z</option>
            </select>
            {(search || vertical !== "All" || status !== "All" || source !== "All") && (
              <button onClick={() => { setSearch(""); setVertical("All"); setStatus("All"); setSource("All"); }}
                className="text-gray-600 hover:text-gray-300 text-sm transition">Clear ✕</button>
            )}
          </div>

          {/* Table */}
          <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-2">🎯</p>
                <p className="text-gray-500 font-semibold">No leads found</p>
                <Link href="/leads/new" className="text-red-400 text-sm hover:underline mt-1 inline-block">Add your first lead →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/5">
                    <tr>
                      {["Lead", "Phone", "Vertical", "Source", "Calls", "Status", "State", user?.role === "admin" ? "Agent" : "Date", ""].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-gray-600 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/3">
                    {filtered.map(lead => (
                      <tr key={lead._id} className="group hover:bg-white/3 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center shrink-0">
                              <span className="text-white text-xs font-bold">{lead.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-white font-semibold text-sm">{lead.name}</p>
                                {lead.disposition && <span title={lead.disposition}>{DISPOSITION_BADGE[lead.disposition]}</span>}
                                {lead.priority === "high" && <span className="text-[10px] text-red-400 font-bold">⚡HIGH</span>}
                              </div>
                              <p className="text-gray-600 text-xs">{lead.email || lead.zipCode || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">{lead.phone}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-gray-300 text-xs font-medium">{lead.vertical || "—"}</p>
                            {lead.subType && <p className="text-gray-600 text-[10px]">{lead.subType}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{lead.leadSource || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-sm">{lead.callCount || 0}</span>
                            {lead.callCount > 0 && (
                              <span className="text-[10px] text-gray-600">
                                ({lead.callsAnswered || 0}✅)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                            {lead.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{lead.state || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                          {user?.role === "admin" ? (lead.agent || "—") : new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <Link href={`/leads/${lead._id}`} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Edit</Link>
                            <button onClick={() => handleDelete(lead._id)} className="text-xs text-red-500 hover:text-red-400">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}