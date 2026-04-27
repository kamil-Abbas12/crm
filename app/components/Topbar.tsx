"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Topbar({ title }: { title: string }) {
  const user = useAuth();
  return (
    <header className="h-14 bg-[#0d0d0d] border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-10">
      <h2 className="text-white font-black text-base tracking-tight flex-1">{title}</h2>

      {user?.role !== "admin" && (
        <Link
          href="/activity"
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/8 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
        >
          📝 Log Activity
        </Link>
      )}

      <Link
        href="/leads/new"
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-lg shadow-red-900/30"
      >
        ＋ New Lead
      </Link>

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center">
        <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || "?"}</span>
      </div>
    </header>
  );
}