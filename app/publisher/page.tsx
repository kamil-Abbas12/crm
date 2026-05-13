"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import AppLayout from "../components/AppLayout";

// Adjust these fields to match your publisher/source data model
type Publisher = {
  _id: string;
  name: string;
  source?: string;         // e.g. "Facebook Ads", "Google", "TV"
  verticals?: string[];    // campaigns this publisher covers
  totalLeads?: number;
  bufferCalls?: number;
  nonBufferCalls?: number;
  totalCalls?: number;
  status?: "active" | "inactive" | "paused";
  createdAt?: string;
};

const SOURCE_ICONS: Record<string, string> = {
  "Facebook Ads": "📘",
  Google:         "🔍",
  TV:             "📺",
  Radio:          "📻",
  "Direct Mail":  "✉️",
  Referral:       "🤝",
  Organic:        "🌿",
};

const STATUS_STYLES = {
  active:   { dot: "bg-emerald-400", badge: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" },
  inactive: { dot: "bg-slate-500",   badge: "bg-slate-900/60  text-slate-400   border-slate-700/40" },
  paused:   { dot: "bg-amber-400",   badge: "bg-amber-950/60  text-amber-400   border-amber-800/40" },
};

const VERTICAL_COLORS: Record<string, string> = {
  Medicare:         "text-blue-400   bg-blue-950/60   border-blue-800/40",
  "Final Expense":  "text-indigo-400 bg-indigo-950/60 border-indigo-800/40",
  "ACA / Health":   "text-violet-400 bg-violet-950/60 border-violet-800/40",
  "Auto Insurance": "text-cyan-400   bg-cyan-950/60   border-cyan-800/40",
  Solar:            "text-sky-400    bg-sky-950/60    border-sky-800/40",
};

export default function PublisherPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [filtered, setFiltered] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "leads" | "bufferCalls">("leads");

  useEffect(() => {
    // Adjust the endpoint to your actual publishers API
    api.get("/api/publishers")
      .then((r) => {
        setPublishers(r.data);
        setFiltered(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...publishers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.source?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }
    result.sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "leads") return (b.totalLeads || 0) - (a.totalLeads || 0);
      if (sortBy === "bufferCalls") return (b.bufferCalls || 0) - (a.bufferCalls || 0);
      return 0;
    });
    setFiltered(result);
  }, [search, statusFilter, sortBy, publishers]);

  // Summary stats
  const totalPublishers = publishers.length;
  const activePublishers = publishers.filter((p) => p.status === "active").length;
  const totalBufferCalls = publishers.reduce((s, p) => s + (p.bufferCalls || 0), 0);
  const totalLeads = publishers.reduce((s, p) => s + (p.totalLeads || 0), 0);

  return (
    <AppLayout title="Publishers">
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">

        {/* Header */}
        <div className="relative rounded-xl border border-violet-800/30 bg-gradient-to-r from-[#12072e] via-[#1a0a40] to-[#0a0f1e] p-4 sm:p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `radial-gradient(ellipse at 0% 50%, #7c3aed 0%, transparent 60%)` }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-violet-400 text-xs font-bold tracking-widest uppercase mb-1">
                Lead Source Management
              </p>
              <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight">
                Publishers
              </h1>
              <p className="text-violet-300/40 text-xs mt-1">
                Track and manage all lead sources and their performance
              </p>
            </div>
            {/* Summary stats */}
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-violet-400/50 text-[10px] font-bold tracking-widest uppercase">
                  Total
                </p>
                <p className="text-white text-2xl font-black tabular-nums">
                  {loading ? "…" : totalPublishers}
                </p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400/50 text-[10px] font-bold tracking-widest uppercase">
                  Active
                </p>
                <p className="text-emerald-400 text-2xl font-black tabular-nums">
                  {loading ? "…" : activePublishers}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-400/50 text-[10px] font-bold tracking-widest uppercase">
                  Buffer
                </p>
                <p className="text-blue-400 text-2xl font-black tabular-nums">
                  {loading ? "…" : totalLeads}
                </p>
              </div>
              <div className="text-center">
                <p className="text-cyan-400/50 text-[10px] font-bold tracking-widest uppercase">
                  Buf. Calls
                </p>
                <p className="text-cyan-400 text-2xl font-black tabular-nums">
                  {loading ? "…" : totalBufferCalls}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/40 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search publishers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1526] border border-blue-900/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-blue-100 placeholder-blue-400/30 focus:outline-none focus:border-violet-600/60 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1526] border border-blue-900/30 rounded-lg px-3 py-2.5 text-sm text-blue-100 focus:outline-none focus:border-violet-600/60 transition"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0d1526] border border-blue-900/30 rounded-lg px-3 py-2.5 text-sm text-blue-100 focus:outline-none focus:border-violet-600/60 transition"
          >
            <option value="leads">Sort: Most Buffer</option>
            <option value="bufferCalls">Sort: Buffer Calls</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>

        {/* Publisher cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-[#0d1526] border border-blue-900/30 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0d1526] border border-blue-900/30 rounded-xl text-center py-20">
            <p className="text-5xl mb-4">📡</p>
            <p className="text-blue-400/60 text-sm font-semibold">
              No publishers found
            </p>
            <p className="text-blue-400/30 text-xs mt-1">
              {search || statusFilter !== "All"
                ? "Try adjusting your filters"
                : "Add your first publisher to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((pub) => {
              const statusStyle = STATUS_STYLES[pub.status || "inactive"];
              const icon = SOURCE_ICONS[pub.source || ""] || "📡";
              const bufferPct =
                pub.totalCalls && pub.totalCalls > 0
                  ? Math.round(((pub.bufferCalls || 0) / pub.totalCalls) * 100)
                  : 0;

              return (
                <div
                  key={pub._id}
                  className="bg-[#0d1526] border border-blue-900/30 rounded-xl p-4 hover:border-violet-600/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-violet-900/10 to-transparent" />
                  <div className="relative space-y-4">

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-900/30 border border-violet-800/30 flex items-center justify-center text-xl shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-black text-sm leading-tight truncate">
                            {pub.name}
                          </p>
                          <p className="text-blue-400/40 text-xs truncate">
                            {pub.source || "Unknown Source"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border shrink-0 ${statusStyle.badge}`}
                      >
                        {pub.status || "inactive"}
                      </span>
                    </div>

                    {/* Verticals */}
                    {pub.verticals && pub.verticals.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pub.verticals.map((v) => (
                          <span
                            key={v}
                            className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full border ${
                              VERTICAL_COLORS[v] ||
                              "text-slate-400 bg-slate-900/60 border-slate-700/40"
                            }`}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-950/30 border border-blue-900/20 rounded-lg p-2 text-center">
                        <p className="text-blue-400/50 text-[9px] font-bold tracking-widest uppercase">
                          Buffer
                        </p>
                        <p className="text-white font-black text-lg tabular-nums">
                          {pub.totalLeads ?? 0}
                        </p>
                      </div>
                      <div className="bg-emerald-950/30 border border-emerald-900/20 rounded-lg p-2 text-center">
                        <p className="text-emerald-400/50 text-[9px] font-bold tracking-widest uppercase">
                          Buf. Calls
                        </p>
                        <p className="text-emerald-400 font-black text-lg tabular-nums">
                          {pub.bufferCalls ?? 0}
                        </p>
                      </div>
                      <div className="bg-rose-950/30 border border-rose-900/20 rounded-lg p-2 text-center">
                        <p className="text-rose-400/50 text-[9px] font-bold tracking-widest uppercase">
                          Non-Buf.
                        </p>
                        <p className="text-rose-400 font-black text-lg tabular-nums">
                          {pub.nonBufferCalls ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Buffer call rate bar */}
                    {(pub.totalCalls ?? 0) > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-400/40 text-[10px]">
                            Buffer Call Rate
                          </span>
                          <span className="text-white text-[10px] font-bold">
                            {bufferPct}%
                          </span>
                        </div>
                        <div className="h-1 bg-blue-900/30 rounded-full">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${bufferPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    {pub.createdAt && (
                      <p className="text-blue-400/20 text-[10px]">
                        Added{" "}
                        {new Date(pub.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <p className="text-blue-400/30 text-xs text-center pb-2">
            Showing {filtered.length} of {publishers.length} publishers
          </p>
        )}
      </div>
    </AppLayout>
  );
}