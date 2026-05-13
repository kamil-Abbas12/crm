"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import AppLayout from "../components/AppLayout";

const VERTICAL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Medicare:         { bg: "bg-blue-950/60",   text: "text-blue-400",   border: "border-blue-800/40" },
  "Final Expense":  { bg: "bg-indigo-950/60", text: "text-indigo-400", border: "border-indigo-800/40" },
  "ACA / Health":   { bg: "bg-violet-950/60", text: "text-violet-400", border: "border-violet-800/40" },
  "Auto Insurance": { bg: "bg-cyan-950/60",   text: "text-cyan-400",   border: "border-cyan-800/40" },
  Solar:            { bg: "bg-sky-950/60",     text: "text-sky-400",    border: "border-sky-800/40" },
};

const DEFAULT_VERTICAL = { bg: "bg-slate-900/60", text: "text-slate-400", border: "border-slate-700/40" };

const STATUS_DOT: Record<string, string> = {
  new:       "bg-blue-400",
  contacted: "bg-indigo-400",
  qualified: "bg-violet-400",
  converted: "bg-emerald-400",
  lost:      "bg-slate-500",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verticalFilter, setVerticalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const verticals = ["All", "Medicare", "Final Expense", "ACA / Health", "Auto Insurance", "Solar"];
  const statuses  = ["All", "new", "contacted", "qualified", "converted", "lost"];

  useEffect(() => {
    api.get("/api/leads")
      .then((r) => {
        // Each lead that has reached "converted" status is a client
        // Adjust the filter below to match your business logic
        const clientLeads = r.data.filter(
          (l: any) => l.status === "converted" || l.isClient
        );
        setClients(clientLeads);
        setFiltered(clientLeads);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = clients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }
    if (verticalFilter !== "All") {
      result = result.filter((c) => c.vertical === verticalFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFiltered(result);
  }, [search, verticalFilter, statusFilter, clients]);

  const totalByVertical = verticals
    .filter((v) => v !== "All")
    .map((v) => ({
      name: v,
      count: clients.filter((c) => c.vertical === v).length,
    }))
    .filter((v) => v.count > 0);

  return (
    <AppLayout title="Clients">
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">

        {/* Header */}
        <div className="relative rounded-xl border border-cyan-800/30 bg-gradient-to-r from-[#071a2e] via-[#0a2040] to-[#0a0f1e] p-4 sm:p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `radial-gradient(ellipse at 0% 50%, #06b6d4 0%, transparent 60%)` }} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
                Client Registry
              </p>
              <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight">
                Clients
              </h1>
              <p className="text-cyan-300/40 text-xs mt-1">
                Converted leads with active campaign associations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-cyan-400/40 text-xs">Total Clients</p>
                <p className="text-white text-3xl font-black tabular-nums">
                  {loading ? "…" : clients.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical breakdown pills */}
        {!loading && totalByVertical.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {totalByVertical.map((v) => {
              const style = VERTICAL_COLORS[v.name] || DEFAULT_VERTICAL;
              return (
                <button
                  key={v.name}
                  onClick={() =>
                    setVerticalFilter(
                      verticalFilter === v.name ? "All" : v.name
                    )
                  }
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${style.bg} ${style.text} ${style.border} ${
                    verticalFilter === v.name
                      ? "ring-2 ring-offset-1 ring-offset-[#0a0f1e] ring-current"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {v.name}
                  <span className="font-black">{v.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/40 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, phone or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d1526] border border-blue-900/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-blue-100 placeholder-blue-400/30 focus:outline-none focus:border-blue-600/60 transition"
            />
          </div>
          <select
            value={verticalFilter}
            onChange={(e) => setVerticalFilter(e.target.value)}
            className="bg-[#0d1526] border border-blue-900/30 rounded-lg px-3 py-2.5 text-sm text-blue-100 focus:outline-none focus:border-blue-600/60 transition"
          >
            {verticals.map((v) => (
              <option key={v} value={v}>
                {v === "All" ? "All Verticals" : v}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1526] border border-blue-900/30 rounded-lg px-3 py-2.5 text-sm text-blue-100 focus:outline-none focus:border-blue-600/60 transition capitalize"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#0d1526] border border-blue-900/30 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-blue-900/30 bg-[#0a1220]">
            <div className="col-span-1" />
            <div className="col-span-3 text-blue-400/50 text-[10px] font-bold tracking-widest uppercase">
              Client
            </div>
            <div className="col-span-3 text-blue-400/50 text-[10px] font-bold tracking-widest uppercase hidden sm:block">
              Phone
            </div>
            <div className="col-span-3 text-blue-400/50 text-[10px] font-bold tracking-widest uppercase">
              Campaign / Vertical
            </div>
            <div className="col-span-2 text-blue-400/50 text-[10px] font-bold tracking-widest uppercase text-right">
              Status
            </div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="space-y-px">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-blue-900/10 animate-pulse mx-4 my-2 rounded-lg"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🧑‍💼</p>
              <p className="text-blue-400/60 text-sm font-semibold">
                No clients found
              </p>
              <p className="text-blue-400/30 text-xs mt-1">
                {search || verticalFilter !== "All" || statusFilter !== "All"
                  ? "Try adjusting your filters"
                  : "Converted leads will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-blue-900/20">
              {filtered.map((client, idx) => {
                const vStyle = VERTICAL_COLORS[client.vertical] || DEFAULT_VERTICAL;
                const dotColor = STATUS_DOT[client.status] || "bg-slate-500";
                const initials = client.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={client._id}
                    className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center hover:bg-blue-900/10 transition group"
                  >
                    {/* Index / avatar */}
                    <div className="col-span-1 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {initials || "?"}
                        </span>
                      </div>
                    </div>

                    {/* Name + email */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {client.name}
                      </p>
                      <p className="text-blue-400/40 text-xs truncate hidden sm:block">
                        {client.email || "—"}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="col-span-3 hidden sm:block">
                      <p className="text-blue-100/70 text-sm font-mono tracking-wide">
                        {client.phone || "—"}
                      </p>
                    </div>

                    {/* Vertical badge */}
                    <div className="col-span-3">
                      {client.vertical ? (
                        <span
                          className={`inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${vStyle.bg} ${vStyle.text} ${vStyle.border}`}
                        >
                          {client.vertical}
                        </span>
                      ) : (
                        <span className="text-blue-400/30 text-xs">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className="text-blue-100/60 text-xs capitalize">
                        {client.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-blue-900/20 flex items-center justify-between">
              <p className="text-blue-400/30 text-xs">
                Showing {filtered.length} of {clients.length} clients
              </p>
              {(search || verticalFilter !== "All" || statusFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setVerticalFilter("All");
                    setStatusFilter("All");
                  }}
                  className="text-blue-400/50 hover:text-blue-300 text-xs transition"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}