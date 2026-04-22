"use client";

import { useState } from "react";
import Link from "next/link";

export default function Topbar({ title }: { title: string }) {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 bg-[#0d0d0d] border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Title */}
      <div className="flex-1">
        <h2 className="text-white font-black text-lg tracking-tight">{title}</h2>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-[#181818] border border-white/8 rounded-lg px-3 py-1.5 gap-2 w-56 focus-within:border-red-800/50 transition-colors">
        <span className="text-gray-600 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-gray-300 text-sm outline-none placeholder-gray-600 w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/leads/new"
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-lg shadow-red-900/30"
        >
          <span className="text-xs">＋</span>
          New Lead
        </Link>

        <button className="relative w-9 h-9 rounded-lg bg-[#181818] border border-white/8 flex items-center justify-center hover:border-red-800/50 transition-colors">
          <span className="text-sm">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#0d0d0d]" />
        </button>
      </div>
    </header>
  );
}