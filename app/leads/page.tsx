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

type Lead = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  zipCode?: string;
  vertical?: string;
  subType?: string;
  leadSource?: string;
  status?: string;
  disposition?: string;
  priority?: string;
  state?: string;
  agent?: string;
  createdAt?: string;
  callCount?: number;
  callsAnswered?: number;
};

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
  hot: "🔥",
  warm: "🌡️",
  cold: "❄️",
};

const VERTICALS = [
  "All",
  "Medicare",
  "Final Expense",
  "ACA / Health",
  "Auto Insurance",
  "Solar",
  "Mortgage Protection",
  "Life Insurance",
  "Annuity",
  "Other",
];

const STATUSES = [
  "All",
  "new",
  "contacted",
  "qualified",
  "callback",
  "appointment_set",
  "applied",
  "converted",
  "not_interested",
  "do_not_call",
  "lost",
];

const SOURCES = [
  "All",
  "Live Transfer",
  "Inbound Call",
  "Direct Mail",
  "Facebook",
  "Google",
  "Referral",
  "Cold Call",
  "TV Ad",
  "Other",
];

export default function LeadsPage() {
  const user = useAuth() as User;

  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [vertical, setVertical] = useState("All");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/leads")
      .then((r) => {
        if (!cancelled) setLeads(Array.isArray(r.data) ? r.data : []);
      })
      .catch((err) => {
        console.error("Failed to load leads:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const safeUser = mounted ? user : null;
  const isAdmin = safeUser?.role === "admin";

  const filtered = useMemo(() => {
    return [...leads]
      .filter((l) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          l.name?.toLowerCase().includes(q) ||
          l.phone?.includes(search) ||
          l.email?.toLowerCase().includes(q) ||
          l.zipCode?.includes(search);

        const matchesVertical = vertical === "All" || l.vertical === vertical;
        const matchesStatus = status === "All" || l.status === status;
        const matchesSource = source === "All" || l.leadSource === source;

        return matchesSearch && matchesVertical && matchesStatus && matchesSource;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }

        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        }

        if (sortBy === "calls") {
          return (b.callCount || 0) - (a.callCount || 0);
        }

        if (sortBy === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }

        return 0;
      });
  }, [leads, search, vertical, status, source, sortBy]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await api.delete(`/api/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setVertical("All");
    setStatus("All");
    setSource("All");
    setSortBy("newest");
  };

  const totalCalls = leads.reduce((sum, l) => sum + (l.callCount || 0), 0);
  const totalAnswered = leads.reduce((sum, l) => sum + (l.callsAnswered || 0), 0);
  const converted = leads.filter((l) => l.status === "converted").length;
  const hotLeads = leads.filter((l) => l.disposition === "hot").length;

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#0a0a0a]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={isAdmin ? "All Leads" : "My Leads"} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-5">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-5">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Total Leads",
                  value: leads.length,
                  icon: "🎯",
                  color: "text-white",
                },
                {
                  label: "Total Calls Made",
                  value: totalCalls,
                  icon: "📞",
                  color: "text-orange-400",
                },
                {
                  label: "Calls Answered",
                  value: totalAnswered,
                  icon: "✅",
                  color: "text-green-400",
                },
                {
                  label: "Converted",
                  value: converted,
                  icon: "🏁",
                  color: "text-cyan-400",
                },
                {
                  label: "Hot Leads",
                  value: hotLeads,
                  icon: "🔥",
                  color: "text-red-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/5 bg-[#111] p-3 text-center sm:p-4"
                >
                  <p className="text-base sm:text-lg">{s.icon}</p>
                  <p className={`tabular-nums text-lg font-black sm:text-2xl ${s.color}`}>
                    {loading ? "…" : s.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-600 sm:text-[11px]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-black text-white sm:text-2xl">
                  {isAdmin ? "All Leads" : "My Leads"}
                </h2>
                <p className="text-sm text-gray-600">
                  {filtered.length} of {leads.length} leads
                </p>
              </div>

              <Link
                href="/leads/new"
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500 sm:w-auto"
              >
                ＋ Add Lead
              </Link>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <input
                  type="text"
                  placeholder="Search name, phone, zip…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-[#1a1a1a] px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-700/50"
                />

                <select
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-[#1a1a1a] px-3 py-2 text-sm text-gray-300 outline-none transition focus:border-red-700/50"
                >
                  {VERTICALS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-[#1a1a1a] px-3 py-2 text-sm text-gray-300 outline-none transition focus:border-red-700/50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All Status" : s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>

                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-[#1a1a1a] px-3 py-2 text-sm text-gray-300 outline-none transition focus:border-red-700/50"
                >
                  {SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-white/8 bg-[#1a1a1a] px-3 py-2 text-sm text-gray-300 outline-none transition focus:border-red-700/50"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="calls">Most calls</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>

              {(search ||
                vertical !== "All" ||
                status !== "All" ||
                source !== "All" ||
                sortBy !== "newest") && (
                <div className="mt-3 flex justify-start">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 transition hover:text-gray-300"
                  >
                    Clear filters ✕
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="space-y-3 lg:hidden">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-xl border border-white/5 bg-[#111]"
                  />
                ))
              ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#111] p-10 text-center">
                  <p className="mb-2 text-4xl">🎯</p>
                  <p className="font-semibold text-gray-500">No leads found</p>
                  <Link
                    href="/leads/new"
                    className="mt-2 inline-block text-sm text-red-400 hover:underline"
                  >
                    Add your first lead →
                  </Link>
                </div>
              ) : (
                filtered.map((lead) => (
                  <div
                    key={lead._id}
                    className="rounded-xl border border-white/5 bg-[#111] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-950">
                        <span className="text-sm font-bold text-white">
                          {lead.name?.charAt(0) || "?"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white sm:text-base">
                            {lead.name || "Unnamed Lead"}
                          </p>
                          {lead.disposition && (
                            <span title={lead.disposition}>
                              {DISPOSITION_BADGE[lead.disposition] || "•"}
                            </span>
                          )}
                          {lead.priority === "high" && (
                            <span className="text-[10px] font-bold text-red-400">
                              ⚡ HIGH
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 break-words text-xs text-gray-500">
                          {lead.email || lead.zipCode || "No extra contact info"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Phone
                        </p>
                        <p className="mt-1 text-gray-300">{lead.phone || "—"}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Vertical
                        </p>
                        <p className="mt-1 text-gray-300">{lead.vertical || "—"}</p>
                        {lead.subType && (
                          <p className="text-[10px] text-gray-600">{lead.subType}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Source
                        </p>
                        <p className="mt-1 text-gray-300">{lead.leadSource || "—"}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Calls
                        </p>
                        <p className="mt-1 text-gray-300">
                          {lead.callCount || 0}
                          {lead.callCount ? ` (${lead.callsAnswered || 0} answered)` : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          State
                        </p>
                        <p className="mt-1 text-gray-300">{lead.state || "—"}</p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          {isAdmin ? "Agent" : "Date"}
                        </p>
                        <p className="mt-1 text-gray-300">
                          {isAdmin
                            ? lead.agent || "—"
                            : lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span
                        className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          STATUS_STYLES[lead.status || "new"] || STATUS_STYLES.new
                        }`}
                      >
                        {(lead.status || "new").replace(/_/g, " ")}
                      </span>

                      <div className="flex gap-3">
                        <Link
                          href={`/leads/${lead._id}`}
                          className="text-sm font-medium text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="text-sm text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-hidden rounded-xl border border-white/5 bg-[#111] lg:block">
              {loading ? (
                <div className="space-y-3 p-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-white/5" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="mb-2 text-4xl">🎯</p>
                  <p className="font-semibold text-gray-500">No leads found</p>
                  <Link
                    href="/leads/new"
                    className="mt-1 inline-block text-sm text-red-400 hover:underline"
                  >
                    Add your first lead →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-white/5">
                      <tr>
                        {[
                          "Lead",
                          "Phone",
                          "Vertical",
                          "Source",
                          "Calls",
                          "Status",
                          "State",
                          isAdmin ? "Agent" : "Date",
                          "",
                        ].map((h, i) => (
                          <th
                            key={i}
                            className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {filtered.map((lead) => (
                        <tr key={lead._id} className="group transition hover:bg-white/3">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-950">
                                <span className="text-xs font-bold text-white">
                                  {lead.name?.charAt(0) || "?"}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {lead.name || "Unnamed Lead"}
                                  </p>
                                  {lead.disposition && (
                                    <span title={lead.disposition}>
                                      {DISPOSITION_BADGE[lead.disposition] || "•"}
                                    </span>
                                  )}
                                  {lead.priority === "high" && (
                                    <span className="text-[10px] font-bold text-red-400">
                                      ⚡HIGH
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-xs text-gray-600">
                                  {lead.email || lead.zipCode || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400">
                            {lead.phone || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <div>
                              <p className="text-xs font-medium text-gray-300">
                                {lead.vertical || "—"}
                              </p>
                              {lead.subType && (
                                <p className="text-[10px] text-gray-600">{lead.subType}</p>
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {lead.leadSource || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white">
                                {lead.callCount || 0}
                              </span>
                              {(lead.callCount || 0) > 0 && (
                                <span className="text-[10px] text-gray-600">
                                  ({lead.callsAnswered || 0}✅)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                STATUS_STYLES[lead.status || "new"] || STATUS_STYLES.new
                              }`}
                            >
                              {(lead.status || "new").replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-gray-600">
                            {lead.state || "—"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">
                            {isAdmin
                              ? lead.agent || "—"
                              : lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                              <Link
                                href={`/leads/${lead._id}`}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(lead._id)}
                                className="text-xs text-red-500 hover:text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
